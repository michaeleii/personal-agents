interface Props {
  recordingUrl: string | null;
}

export default function Recording({ recordingUrl }: Props) {
  return (
    <div className="rounded-lg border bg-white px-4 py-5">
      {recordingUrl ? (
        <video src={recordingUrl} className="w-full rounded-lg" controls />
      ) : (
        <div className="text-muted-foreground py-4 text-center">
          No Recording available
        </div>
      )}
    </div>
  );
}
