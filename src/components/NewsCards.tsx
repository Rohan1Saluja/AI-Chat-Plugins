import { NewsArticleModel } from "@/types/plugin-manager";
import Image from "next/image";

export const NewsArticleCard = ({ article }: { article: NewsArticleModel }) => {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-background-600 hover:bg-background-500 p-3 rounded-lg shadow mb-3 transition-colors duration-150"
    >
      {article.urlToImage && (
        <Image
          src={article.urlToImage}
          alt={article.title}
          width={400}
          height={128}
          className="object-cover rounded-md mb-2"
          onError={(e) => (e.currentTarget.style.display = "none")} // Hide if image fails to load
        />
      )}
      <h4 className="text-md font-semibold text-primary-300 mb-1 leading-tight">
        {article.title}
      </h4>
      <p className="text-xs text-textColor-300 mb-1 truncate">
        {article.description || "No description available."}
      </p>
      <div className="text-xs text-textColor-500 flex justify-between items-center">
        <span>{article.source.name}</span>
        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
      </div>
    </a>
  );
};

// -------------------------------------------------------
// Container for multiple news articles
export const NewsFeedCard = ({
  articles,
  query,
}: {
  articles: NewsArticleModel[];
  query?: string;
}) => {
  if (!articles || articles.length === 0) {
    return (
      <p className="text-textColor-400 p-3">
        No news articles found {query ? `for "${query}"` : "for your request"}.
      </p>
    );
  }
  return (
    <div className="bg-background-700 p-3 rounded-lg shadow-md text-textColor-100 w-full max-h-96 overflow-y-auto">
      {query && (
        <h3 className="text-lg font-semibold text-accent-400 mb-2">
          Top Headlines {`for "${query}"`}:
        </h3>
      )}
      {!query && (
        <h3 className="text-lg font-semibold text-accent-400 mb-2">
          Top Headlines:
        </h3>
      )}
      {articles.map((article, index) => (
        <NewsArticleCard key={article.url || index} article={article} />
      ))}
    </div>
  );
};
