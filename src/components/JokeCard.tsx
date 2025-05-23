import { JokeModel } from "@/types/plugin-manager";

const JokeCard = ({ data }: { data: JokeModel }) => {
  return (
    <>
      {data.type === "single" && data.joke && (
        <p className="text-lg">{data.joke}</p>
      )}
      {data.type === "twopart" && data.setup && data.delivery && (
        <>
          <p className="text-lg font-medium">{data.setup}</p>
          <p className="mt-2 italic">... {data.delivery}</p>
        </>
      )}
      {data.category && (
        <p className="text-xs text-text-400 mt-3">Category: {data.category}</p>
      )}
    </>
  );
};

export default JokeCard;
