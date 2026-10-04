import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    let errorMessage = "Unknown Error";
    if (isRouteErrorResponse(error)) {
        errorMessage = `${error.status} ${error.statusText}`;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground space-y-4 p-4 text-center animate-in fade-in zoom-in duration-500">
            <h1 className="text-4xl font-bold tracking-tight text-destructive">Oops!</h1>
            <p className="text-xl text-muted-foreground">Sorry, an unexpected error has occurred.</p>
            <div className="max-w-md w-full overflow-auto">
                <p className="font-mono text-sm bg-muted p-4 rounded-md border text-left break-all">
                    {errorMessage}
                </p>
            </div>
            <div className="flex gap-2 mt-4">
                <Button onClick={() => window.location.reload()} variant="outline">
                    Try Again
                </Button>
                <Button asChild>
                    <a href="/">Go to Dashboard</a>
                </Button>
            </div>
        </div>
    );
}
