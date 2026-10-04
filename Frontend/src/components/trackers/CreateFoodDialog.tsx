
import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateFood } from '@/hooks/useMeals';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

const foodSchema = z.object({
    name: z.string().min(2, "Name required"),
    servingSize: z.coerce.number().min(0.1),
    unit: z.string().min(1),
    calories: z.coerce.number().min(0),
    proteinG: z.coerce.number().min(0),
    carbsG: z.coerce.number().min(0),
    fatG: z.coerce.number().min(0),
});

type FoodFormValues = z.infer<typeof foodSchema>;

export function CreateFoodDialog() {
    const [open, setOpen] = useState(false);
    const createFood = useCreateFood();

    const form = useForm<FoodFormValues>({
        resolver: zodResolver(foodSchema) as Resolver<FoodFormValues>,
        defaultValues: {
            name: '',
            servingSize: 100,
            unit: 'g',
            calories: 0,
            proteinG: 0,
            carbsG: 0,
            fatG: 0,
        },
    });

    function onSubmit(values: FoodFormValues) {
        createFood.mutate(values, {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Create New Food
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Custom Food</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Chicken Breast" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="servingSize"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Serving Size</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit</FormLabel>
                                        <FormControl>
                                            <Input placeholder="g, ml, slice" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="calories"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Calories</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="proteinG"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Protein (g)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="carbsG"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Carbs (g)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="fatG"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fat (g)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={createFood.isPending}>
                                {createFood.isPending ? 'Creating...' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
