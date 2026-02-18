import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

const PLATE_COLORS: Record<number, string> = {
  25: 'bg-red-500',
  20: 'bg-blue-500',
  15: 'bg-yellow-500',
  10: 'bg-green-500',
  5: 'bg-primary/60',
  2.5: 'bg-muted-foreground/40',
  1.25: 'bg-muted-foreground/20',
};

function calculatePlates(totalWeight: number, barWeight = 20): { plate: number; count: number }[] {
  let perSide = (totalWeight - barWeight) / 2;
  if (perSide <= 0) return [];

  const result: { plate: number; count: number }[] = [];
  for (const plate of PLATES) {
    const count = Math.floor(perSide / plate);
    if (count > 0) {
      result.push({ plate, count });
      perSide -= plate * count;
    }
  }
  return result;
}

export function PlateCalculator({
  weight,
  open,
  onOpenChange,
}: {
  weight: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const barWeight = 20;
  const plates = calculatePlates(weight, barWeight);
  const perSide = Math.max(0, (weight - barWeight) / 2);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Plate Calculator</SheetTitle>
          <SheetDescription>
            {weight}kg total · {barWeight}kg bar · {perSide.toFixed(1)}kg per side
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          {weight <= barWeight || plates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {weight <= barWeight
                ? 'Weight is less than or equal to the bar'
                : 'Cannot be made with standard plates'}
            </p>
          ) : (
            <div className="space-y-3">
              {/* Visual barbell */}
              <div className="flex items-center justify-center gap-0.5 py-4">
                {plates
                  .slice()
                  .reverse()
                  .map(({ plate, count }) =>
                    Array.from({ length: count }).map((_, i) => (
                      <div
                        key={`l-${plate}-${i}`}
                        className={`${PLATE_COLORS[plate]} rounded-sm`}
                        style={{
                          width: `${Math.max(8, plate * 1.2)}px`,
                          height: `${Math.max(24, plate * 1.8)}px`,
                        }}
                      />
                    ))
                  )}
                <div className="h-3 w-20 rounded bg-muted-foreground/30" />
                {plates.map(({ plate, count }) =>
                  Array.from({ length: count }).map((_, i) => (
                    <div
                      key={`r-${plate}-${i}`}
                      className={`${PLATE_COLORS[plate]} rounded-sm`}
                      style={{
                        width: `${Math.max(8, plate * 1.2)}px`,
                        height: `${Math.max(24, plate * 1.8)}px`,
                      }}
                    />
                  ))
                )}
              </div>
              {/* Plate list */}
              <div className="space-y-1.5">
                {plates.map(({ plate, count }) => (
                  <div
                    key={plate}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-sm ${PLATE_COLORS[plate]}`} />
                      <span className="text-sm font-medium">{plate}kg</span>
                    </div>
                    <span className="text-sm text-muted-foreground">×{count} per side</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
