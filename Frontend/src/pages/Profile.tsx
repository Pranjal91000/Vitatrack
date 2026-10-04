
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { profileToRequest, useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    age: z.coerce.number().min(1).optional(),
    weightKg: z.coerce.number().min(1).optional(),
    heightCm: z.coerce.number().min(1).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// eslint-disable-next-line react-refresh/only-export-components
export function Profile() {
    const { data: profile, isLoading } = useProfile();
    const updateProfile = useUpdateProfile();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema) as Resolver<ProfileFormValues>,
        defaultValues: {
            name: '',
            age: undefined,
            weightKg: undefined,
            heightCm: undefined,
        },
    });

    useEffect(() => {
        if (profile) {
            form.reset({
                name: profile.name,
                age: profile.age ?? undefined,
                weightKg: profile.weightKg ?? undefined,
                heightCm: profile.heightCm ?? undefined,
            });
        }
    }, [profile, form]);

    function onSubmit(values: ProfileFormValues) {
        if (!profile) return;
        updateProfile.mutate(profileToRequest(profile, values));
    }

    if (isLoading) return <ProfileSkeleton />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto w-full">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">Personal details and body metrics used for goals and BMR.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Update your name and measurements.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="age"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Age</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="25" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="weightKg"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Weight (kg)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="70" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="heightCm"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Height (cm)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="175" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={updateProfile.isPending}>
                                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {profile?.bmr && (
                <Card>
                    <CardHeader>
                        <CardTitle>Calculated Metrics</CardTitle>
                        <CardDescription>Based on your latest body metrics.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div>
                                <p className="font-medium text-lg">Basal Metabolic Rate (BMR)</p>
                                <p className="text-sm text-muted-foreground">Calories burned at rest</p>
                            </div>
                            <div className="text-2xl font-bold text-primary">
                                {Math.round(profile.bmr)} <span className="text-sm text-muted-foreground font-normal">kcal/day</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[150px] w-full" />
        </div>
    );
}
