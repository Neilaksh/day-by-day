import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = "text", width, height, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted rounded",
        variant === "text" && "h-4",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-md",
        className,
      )}
      style={{ width, height, minWidth: width, minHeight: height }}
      {...props}
    />
  );
}

export function TrackerBoardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <Skeleton variant="text" width="40%" height="1.5rem" />
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width="2rem" height="2rem" />
          <Skeleton variant="text" width="3rem" height="1.5rem" />
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-foreground/15 bg-card shadow-sm">
        <div className="min-w-max">
          <div
            className="grid border-b border-foreground/15"
            style={{ gridTemplateColumns: "3fr repeat(31, 1fr)" }}
          >
            <Skeleton
              variant="rectangular"
              className="border-r border-foreground/15 px-4 py-2 h-8"
            />
            {Array.from({ length: 31 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                className="border-r border-foreground/15 px-2 py-2 h-8"
              />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, row) => (
            <div
              key={row}
              className="grid border-b border-foreground/15 last:border-b-0"
              style={{ gridTemplateColumns: "3fr repeat(31, 1fr)" }}
            >
              <Skeleton
                variant="rectangular"
                className="border-r border-foreground/15 px-4 py-2 h-9"
              />
              {Array.from({ length: 31 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  className="border-r border-foreground/15 h-9"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 overflow-x-auto rounded-lg border border-foreground/15 bg-card shadow-sm">
        <div className="min-w-max">
          <div
            className="grid border-b border-foreground/15"
            style={{ gridTemplateColumns: "3fr repeat(31, 1fr)" }}
          >
            <Skeleton
              variant="rectangular"
              className="border-r border-foreground/15 px-4 py-2 h-8"
            />
            {Array.from({ length: 31 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                className="border-r border-foreground/15 py-1 h-8"
              />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, row) => (
            <div
              key={row}
              className="grid border-b border-foreground/15 last:border-b-0"
              style={{ gridTemplateColumns: "3fr repeat(31, 1fr)" }}
            >
              <Skeleton
                variant="rectangular"
                className="border-r border-foreground/15 px-4 py-2 h-10"
              />
              {Array.from({ length: 31 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  className="border-r border-foreground/15 h-10"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 rounded-lg border border-foreground/15 bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <Skeleton variant="text" width="25%" height="1rem" />
          <Skeleton variant="text" width="20%" height="0.75rem" />
        </div>
        <Skeleton variant="rectangular" className="h-24 w-full" />
      </div>
    </div>
  );
}

export function NotesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton variant="text" width="30%" height="2rem" />
        <div className="flex items-center gap-2">
          <Skeleton variant="rectangular" width="80px" height="2rem" />
          <Skeleton variant="rectangular" width="80px" height="2rem" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-foreground/15 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" width="60%" height="1rem" />
              <Skeleton variant="circular" width="1rem" height="1rem" />
            </div>
            <Skeleton variant="text" className="mt-2" width="80%" />
            <Skeleton variant="text" className="mt-1" width="40%" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthSkeleton() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-4 py-16">
      <div className="mb-10 text-center">
        <Skeleton variant="text" className="mx-auto" width="20%" height="0.75rem" />
        <Skeleton variant="text" className="mx-auto mt-3" width="60%" height="3rem" />
        <Skeleton variant="text" className="mx-auto mt-4 max-w-md" width="80%" />
      </div>
      <div className="w-full max-w-sm rounded-lg border border-foreground/15 bg-card p-6 shadow-sm">
        <div className="mb-5 flex gap-1 rounded-sm border border-border bg-muted p-1">
          <Skeleton variant="rectangular" className="flex-1 h-6" />
          <Skeleton variant="rectangular" className="flex-1 h-6" />
        </div>
        <div className="space-y-4">
          <div>
            <Skeleton variant="text" width="30%" height="0.875rem" />
            <Skeleton variant="rectangular" className="mt-1.5 w-full h-10" />
          </div>
          <div>
            <Skeleton variant="text" width="30%" height="0.875rem" />
            <Skeleton variant="rectangular" className="mt-1.5 w-full h-10" />
          </div>
          <Skeleton variant="rectangular" className="w-full h-10" />
        </div>
      </div>
    </section>
  );
}
