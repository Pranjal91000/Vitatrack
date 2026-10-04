FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY VitaTrack.Backend.sln ./
COPY src/VitaTrack.Core/VitaTrack.Core.csproj src/VitaTrack.Core/
COPY src/VitaTrack.Infrastructure/VitaTrack.Infrastructure.csproj src/VitaTrack.Infrastructure/
COPY src/VitaTrack.Api/VitaTrack.Api.csproj src/VitaTrack.Api/

RUN dotnet restore VitaTrack.Backend.sln

COPY . .
RUN dotnet publish src/VitaTrack.Api/VitaTrack.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "VitaTrack.Api.dll"]