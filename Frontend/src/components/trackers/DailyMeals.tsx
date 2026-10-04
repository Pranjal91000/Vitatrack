
import { useMeals, useDeleteMeal } from '@/hooks/useMeals';
import { useDateStore } from '@/store/dateStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { NutritionSummary } from './NutritionSummary';
import { NutrientSummaryDto } from '@/types/api';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

import { Separator } from '@/components/ui/separator';

export function DailyMeals() {
    const currentDate = useDateStore((state) => state.currentDate);
    const { data, isLoading } = useMeals(currentDate);
    const deleteMeal = useDeleteMeal();
    const [openStates, setOpenStates] = useState<Record<string, boolean>>({});

    const toggleOpen = (id: string) => {
        setOpenStates(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-[200px] w-full rounded-xl" />)}
            </div>
        )
    }

    if (!data?.meals?.length) {
        return (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                No meals logged for this day.
            </div>
        )
    }

    const nutritionSummary: NutrientSummaryDto = data.meals.reduce(
        (acc, meal) => {
            return {
                calories: acc.calories + (meal.grandTotal?.calories ?? 0),
                proteinG: acc.proteinG + (meal.grandTotal?.proteinG ?? 0),
                carbsG: acc.carbsG + (meal.grandTotal?.carbsG ?? 0),
                fatG: acc.fatG + (meal.grandTotal?.fatG ?? 0),
            };
        },
        {
            calories: 0,
            proteinG: 0,
            carbsG: 0,
            fatG: 0,
        }
    );

    return (
        <div className="space-y-6">
            {/* Daily Total Summary */}
            <Card className="bg-primary/5 border-primary/10">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Daily Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <NutritionSummary totals={nutritionSummary} />
                </CardContent>
            </Card>

            <Separator />

            <div className="space-y-4">
                {data.meals.map((meal) => (
                    <Collapsible
                        key={meal.id}
                        open={openStates[meal.id] ?? true}
                        onOpenChange={() => toggleOpen(String(meal.id))}
                        className="space-y-2"
                    >
                        <div className="flex items-center justify-between group">
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="p-0 hover:bg-transparent justify-start w-auto font-semibold text-lg gap-2">
                                    {openStates[meal.id] === false ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                    {meal.mealSlotName}
                                </Button>
                            </CollapsibleTrigger>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">{Math.round(meal.grandTotal?.calories ?? 0)} kcal</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteMeal.mutate(meal.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <CollapsibleContent>
                            <Card>
                                <CardContent className="p-0">
                                    {meal.foods.map((item, idx) => (
                                        <div key={item.id} className={`flex items-center justify-between p-4 ${idx !== meal.foods.length - 1 ? 'border-b' : ''}`}>
                                            <div>
                                                <p className="font-medium">{item.food.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.quantity} x {item.food.servingSize}{item.food.unit}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{Math.round(item.totals?.calories ?? 0)} kcal</p>
                                                <div className="flex gap-2 text-[10px] text-muted-foreground">
                                                    <span className="text-blue-500">{Math.round(item.totals?.proteinG ?? 0)}p</span>
                                                    <span className="text-orange-500">{Math.round(item.totals?.carbsG ?? 0)}c</span>
                                                    <span className="text-yellow-500">{Math.round(item.totals?.fatG ?? 0)}f</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="bg-muted/30 p-3 flex justify-between items-center text-xs text-muted-foreground">
                                        <span>Meal Totals</span>
                                        <div className="flex gap-3">
                                            <span>{Math.round(meal.grandTotal?.proteinG ?? 0)}g Protein</span>
                                            <span>{Math.round(meal.grandTotal?.carbsG ?? 0)}g Carbs</span>
                                            <span>{Math.round(meal.grandTotal?.fatG ?? 0)}g Fat</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </div>
        </div>
    );
}
