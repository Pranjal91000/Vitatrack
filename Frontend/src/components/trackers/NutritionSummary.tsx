import { NutrientSummaryDto } from '@/types/api';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export interface NutritionSummaryProps {
    totals: NutrientSummaryDto;
}

export function NutritionSummary({ totals }: NutritionSummaryProps) {
    const items = [
        { label: 'Calories', value: Math.round(totals.calories ?? 0), unit: 'kcal', color: 'text-primary' },
        { label: 'Protein', value: Math.round(totals.proteinG ?? 0), unit: 'g', color: 'text-blue-500' },
        { label: 'Carbs', value: Math.round(totals.carbsG ?? 0), unit: 'g', color: 'text-orange-500' },
        { label: 'Fat', value: Math.round(totals.fatG ?? 0), unit: 'g', color: 'text-yellow-500' },
    ];

    return (
        <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4")}>
            {items.map((item) => (
                <Card key={item.label} className="bg-muted/50 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">{item.label}</span>
                        <div className={cn("text-2xl font-bold", item.color)}>
                            {item.value}<span className="text-sm text-muted-foreground ml-1 font-normal">{item.unit}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
