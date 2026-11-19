import { notFound } from "next/navigation";
import { PlaygroundSpike } from "./PlaygroundSpike";

export default function DevPlaygroundPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <PlaygroundSpike />;
}
