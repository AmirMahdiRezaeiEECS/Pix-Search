import { useState, useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { imagesIndex, ImageDocument, similarSearch } from "@/lib/meilisearch";
import { SearchBar } from "@/components/SearchBar";
import { useKeyboardHeight } from "@/hooks/use-keyboard-height";
import { ImageCard } from "@/components/ImageCard";
import { Button } from "@/components/ui/button";
import { HelpCircle, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

const IMAGES_PER_PAGE = 50;

const DEFAULT_QUERIES = [
  "Sunset landscape",
  "City architecture",
  "Nature wildlife",
  "Street photography",
  "Ocean waves",
  "Mountain peaks",
  "Autumn colors",
  "Urban night lights",
  "Forest trees",
  "Flowers macro",
  "Portrait photography",
  "Abstract art",
  "Black and white",
  "Vintage cars",
  "Food photography",
  "Travel destinations",
  "Animals in nature",
  "Beach scenes",
  "Snow landscapes",
  "Desert dunes",
  "Tropical paradise",
  "Storm clouds",
  "River flowing",
  "Butterfly close-up",
  "Bird in flight",
  "Ancient ruins",
  "Modern buildings",
  "Starry night sky",
  "Cherry blossoms",
  "Waterfall cascade",
  "Misty morning",
  "Dusk, Gloaming, or Eventide",
  "Raindrops",
  "Ice formations",
  "Cactus plants",
  "Coastal cliffs",
  "Urban graffiti",
  "Market scenes",
  "Festival lights",
  "Mountain reflection",
  "Airplane takeoff",
  "Fighter jets formation",
  "Vintage aircraft",
];

const getRandomQuery = () => DEFAULT_QUERIES[Math.floor(Math.random() * DEFAULT_QUERIES.length)];

const Index = () => {
  const keyboardHeight = useKeyboardHeight();
  const [searchQuery, setSearchQuery] = useState(getRandomQuery());
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const [similarityMode, setSimilarityMode] = useState<{ image: ImageDocument; id: string } | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: similarityMode ? ["similar", similarityMode.id] : ["images", searchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      if (similarityMode) {
        const results = await similarSearch(similarityMode.id, IMAGES_PER_PAGE, pageParam);
        return {
          hits: results.hits as ImageDocument[],
          nextOffset: pageParam + IMAGES_PER_PAGE,
          hasMore: results.hits.length === IMAGES_PER_PAGE,
        };
      } else {
        const results = await imagesIndex.search(searchQuery, {
          limit: IMAGES_PER_PAGE,
          offset: pageParam,
          hybrid: {
            embedder: "bedrock",
          },
          showRankingScoreDetails: true,
        });
        return {
          hits: results.hits as ImageDocument[],
          nextOffset: pageParam + IMAGES_PER_PAGE,
          hasMore: results.hits.length === IMAGES_PER_PAGE,
        };
      }
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextOffset : undefined),
    initialPageParam: 0,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Scroll to top on new search or similarity mode change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchQuery, similarityMode]);

  // Infinite scroll observer - load next page earlier for seamless experience
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "600px", // Trigger when element is 600px away from viewport
        threshold: 0.1
      },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleImageClick = (image: ImageDocument) => {
    // Generate a simple ID from the URL
    const id = image.url.split('/').pop()?.split('.')[0] || image.url;
    setSimilarityMode({ image, id });
    setSearchQuery('');
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Exit similarity mode when user starts typing
    if (value && similarityMode) {
      setSimilarityMode(null);
    }
  };

  const allImages = data?.pages.flatMap((page) => page.hits) ?? [];
  
  // If in similarity mode, prepend the selected image
  const displayImages = similarityMode 
    ? [similarityMode.image, ...allImages.filter(img => img.url !== similarityMode.image.url)]
    : allImages;
  return (
    <>
      <div className="min-h-screen bg-background pb-32">
        {/* Image Grid - No gaps, squared images */}
        <main className="py-0">
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
              {Array.from({
                length: 30,
              }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:1000px_100%]"
                  style={{ animationDelay: `${i * 20}ms` }}
                />
              ))}
            </div>
          ) : displayImages.length > 0 ? (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                {displayImages.map((image, index) => (
                  <ImageCard 
                    key={`${image.url}-${index}`} 
                    image={image} 
                    priority={index < 14}
                    onClick={() => handleImageClick(image)}
                  />
                ))}
              </div>
              {/* Load more trigger */}
              <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                {isFetchingNextPage && (
                  <div className="flex gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16 px-4">
              <p className="text-lg text-muted-foreground">No images found</p>
            </div>
          )}
        </main>

        {/* Floating Info Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsInfoOpen(true)}
          className="hidden md:flex fixed bottom-0 right-6 z-50 h-14 w-14 rounded-full bg-[rgb(var(--glass-bg))] backdrop-blur-[6px] shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] border-0 hover:bg-[rgb(var(--glass-bg))]/80 transition-all duration-300"
          style={{ marginBottom: `${keyboardHeight > 0 ? keyboardHeight + 24 : 24}px` }}
          title="Image source information"
        >
          <HelpCircle className="h-7 w-7" />
        </Button>

        {/* Bottom Search Bar */}
        <SearchBar value={searchQuery} onChange={handleSearchChange} />
      </div>

      {/* Info Modal */}
      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent
          className="max-w-4xl w-[90vw] max-h-[90vh] bg-white/40 backdrop-blur-[16px] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] overflow-y-auto"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-black">How did we setup Meilisearch?</DialogTitle>
            <DialogDescription className="text-black/80">
              Technical implementation details for semantic image search
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 text-sm text-black">
            {/* Part 1: Document Shape and Dataset Source */}
            <div>
              <h3 className="font-semibold mb-3 text-black text-lg">1. Document Structure & Dataset Source</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-black mb-2">Dataset Source</h4>
                  <p className="text-black/80 mb-3">
                    Images are sourced from the{" "}
                    <a
                      href="https://registry.opendata.aws/multimedia-commons/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black font-semibold hover:underline"
                    >
                      Multimedia Commons dataset
                    </a>
                    , containing 99,171,688 Creative Commons-licensed Flickr images from the YFCC100M dataset by Yahoo! Labs.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-2">Document Shape</h4>
                  <p className="text-black/80 mb-3">
                    Each image is{" "}
                    <a
                      href="https://www.meilisearch.com/docs/reference/api/documents#get-documents-with-post"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black font-semibold hover:underline"
                    >
                      stored as a document in Meilisearch
                    </a>
                    {" "}with the following structure.
                  </p>
                  <div className="relative">
                    <pre className="bg-black/10 p-3 rounded text-black/80 overflow-x-hidden whitespace-pre-wrap break-words pr-12">
{`{
  "url": "https://multimedia-commons.s3-us-west-2.amazonaws.com/...",
  "base64": "[image base64]",
  "width": 500,
  "height": 333,
  "format": "jpeg",
  "size": 72205
}`}
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(`{
  "url": "https://multimedia-commons.s3-us-west-2.amazonaws.com/...",
  "base64": "[image base64]",
  "width": 500,
  "height": 333,
  "format": "jpeg",
  "size": 72205
}`, 'document-shape')}
                      className="absolute top-2 right-2 h-8 w-8 text-black/60 hover:text-black hover:bg-black/10"
                    >
                      {copiedStates['document-shape'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Part 2: Meilisearch Settings */}
            <div>
              <h3 className="font-semibold mb-3 text-black text-lg">2. Meilisearch Configuration</h3>
              <p className="text-black/80 mb-3">
                We setup the{" "}
                <a
                  href="https://www.meilisearch.com/docs/reference/api/settings#update-settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black font-semibold hover:underline"
                >
                  Meilisearch index settings
                </a>
                {" "}with Amazon Bedrock's Titan image embedding model for semantic search capabilities.
              </p>
              <div>
                <h4 className="font-semibold text-black mb-2">Index Settings</h4>
                <div className="relative">
                  <div className="bg-black/10 rounded p-3 pr-12">
                    <pre className="text-black/80 overflow-x-hidden whitespace-pre-wrap break-words">
{`{
  "displayedAttributes": ["url"],
  "searchableAttributes": [],
  "embedders": {
    "bedrock": {
      "source": "rest",
      "apiKey": "ABSKQXXXXXX...",
      "dimensions": 1024,
      "url": "https://bedrock-runtime.eu-west-3.amazonaws.com/model/amazon.titan-embed-image-v1/invoke"${isSettingsOpen ? `,
      "indexingFragments": {
        "image": {
          "value": {
            "inputImage": "{{doc.base64}}",
            "embeddingConfig": {
              "outputEmbeddingLength": 1024
            }
          }
        }
      },
      "searchFragments": {
        "text": {
          "value": {
            "inputText": "{{q}}",
            "embeddingConfig": {
              "outputEmbeddingLength": 1024
            }
          }
        }
      },
      "request": "{{fragment}}",
      "response": {
        "embedding": "{{embedding}}"
      },
      "headers": {}` : ''}
    }
  },
  "vectorStore": "experimental"
}`}
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(`{
  "displayedAttributes": ["url"],
  "searchableAttributes": [],
  "embedders": {
    "bedrock": {
      "source": "rest",
      "apiKey": "ABSKQXXXXXX...",
      "dimensions": 1024,
      "url": "https://bedrock-runtime.eu-west-3.amazonaws.com/model/amazon.titan-embed-image-v1/invoke",
      "indexingFragments": {
        "image": {
          "value": {
            "inputImage": "{{doc.base64}}",
            "embeddingConfig": {
              "outputEmbeddingLength": 1024
            }
          }
        }
      },
      "searchFragments": {
        "text": {
          "value": {
            "inputText": "{{q}}",
            "embeddingConfig": {
              "outputEmbeddingLength": 1024
            }
          }
        }
      },
      "request": "{{fragment}}",
      "response": {
        "embedding": "{{embedding}}"
      },
      "headers": {}
    }
  },
  "vectorStore": "experimental"
}`, 'index-settings')}
                      className="absolute top-2 right-2 h-8 w-8 text-black/60 hover:text-black hover:bg-black/10"
                    >
                      {copiedStates['index-settings'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <CollapsibleTrigger className="flex items-center gap-2 text-black/60 hover:text-black transition-colors mt-2 text-xs">
                      <span>{isSettingsOpen ? 'Show Less' : 'Show Complete Settings'}</span>
                      <ChevronDown className={`h-3 w-3 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                  </Collapsible>
                </div>
              </div>
            </div>

            {/* Part 3: Query Example */}
            <div>
              <h3 className="font-semibold mb-3 text-black text-lg">3. Search Query</h3>
              <p className="text-black/80 mb-3">
                Here's how we{" "}
                <a
                  href="https://www.meilisearch.com/docs/reference/api/search#search-in-an-index-with-post"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black font-semibold hover:underline"
                >
                  query the index using hybrid search
                </a>
                {" "}with the Bedrock embedder:
              </p>
              <div>
                <h4 className="font-semibold text-black mb-2">Example Query</h4>
                <div className="relative">
                  <pre className="bg-black/10 p-3 rounded text-black/80 overflow-x-hidden whitespace-pre-wrap break-words pr-12">
{`{
  "q": "Mountain rivers",
  "hybrid": {
    "embedder": "bedrock"
  }
}`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(`{
  "q": "Mountain rivers",
  "hybrid": {
    "embedder": "bedrock"
  }
}`, 'example-query')}
                    className="absolute top-2 right-2 h-8 w-8 text-black/60 hover:text-black hover:bg-black/10"
                  >
                    {copiedStates['example-query'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default Index;
