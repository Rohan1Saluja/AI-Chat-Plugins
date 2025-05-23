import { DictionaryModel } from "@/types/plugin-manager";
import { Volume2 } from "lucide-react";

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
    <>
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
            <Volume2 />
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
    </>
  );
}
