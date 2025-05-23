import { WeatherModel } from "@/types/plugin-manager";
import Image from "next/image";

interface Props {
  data: WeatherModel;
}

export default function WeatherCard({ data }: Props) {
  if (!data) return <p className="text-text-400">No weather data available.</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3>
            {data.city}, {data.country}
          </h3>
          <p className="capitalize">{data.description}</p>
        </div>
        {data.icon && (
          <Image
            src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
            alt={data.description}
            width={64}
            height={64}
            className="bg-primary-500/30 rounded-full"
          />
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <p>
          <span className="font-medium text-text-300">Temperature:</span>
          {data.temp.toFixed(1)}°C
        </p>
        <p>
          <span className="font-medium text-text-300">Humidity:</span>
          {data.humidity}%
        </p>
        <p>
          <span className="font-medium text-text-300">Wind:</span>
          {data.windSpeed.toFixed(1)} m/s
        </p>
      </div>
    </>
  );
}
