import { MergePanel } from "@/components/merge-panel";

export default function MergePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold tracking-tight">Merge Media Files</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Combine two or more video or audio files in your browser. Files stay on your device.
          </p>
        </div>
        <MergePanel />
      </main>
    </div>
  );
}
