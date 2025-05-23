import { DictionaryModel } from "@/types/plugin-manager";

interface Props {
  data: DictionaryModel[];
}

export default function DefinitionCard({ data }: Props) {
  if (!data || data.length === 0)
    return <p className="text-text-400">No definition found.</p>;

  const entry = data[0];

  const playAudio = (audioUrl?: string) => {
    if (audioUrl) new Audio(audioUrl).play();
  };

  const phoneticWithAudio = entry.phonetics.find((p) => p.audio);
  const phoneticText =
    entry.phonetic || entry.phonetics.find((p) => p.text)?.text;

  return (
    <div className="bg-background-700 p-4 rounded-lg shadow-md text-textColor-100 w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-2xl font-bold text-secondary-400">{entry.word}</h3>
        {phoneticText && (
          <span className="text-lg text-textColor-300 italic">
            {phoneticText}
          </span>
        )}
        {phoneticWithAudio?.audio && (
          <button
            onClick={() => playAudio(phoneticWithAudio.audio)}
            className="ml-2 p-2 bg-primary-600 hover:bg-primary-500 rounded-full text-white hover:cursor-pointer"
            aria-label="Play pronunciation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 6.757 3.63 6.25 4.51 6.25H6.75z"
              />
            </svg>
          </button>
        )}
      </div>

      {entry.meanings.map((meaning, index) => (
        <div key={index} className="mb-4">
          <h4 className="text-md font-semibold text-accent-400 capitalize italic">
            {meaning.partOfSpeech}
          </h4>
          {meaning.definitions.slice(0, 3).map((def, defIndex) => (
            <div key={defIndex} className="ml-4 mb-2">
              <p className="text-textColor-100">- {def.definition}</p>
              {def.example && (
                <p className="text-sm text-textColor-400 italic ml-2">
                  e.g., "{def.example}"
                </p>
              )}
            </div>
          ))}
        </div>
      ))}
      {entry.sourceUrls?.[0] && (
        <a
          href={entry.sourceUrls[0]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary-300 hover:text-primary-200 mt-2 block"
        >
          Source: {entry.sourceUrls[0].split("/")[2]}
        </a>
      )}
    </div>
  );
}
