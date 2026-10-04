FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["VitaTrack.Backend.sln", "."]
COPY ["src/VitaTrack.Api/VitaTrack.Api.csproj", "src/VitaTrack.Api/"]
COPY ["src/VitaTrack.Core/VitaTrack.Core.csproj", "src/VitaTrack.Core/"]
COPY ["src/VitaTrack.Infrastructure/VitaTrack.Infrastructure.csproj", "src/VitaTrack.Infrastructure/"]
RUN dotnet restore "src/VitaTrack.Api/VitaTrack.Api.csproj"

COPY . .
WORKDIR "/src/src/VitaTrack.Api"
RUN dotnet publish "VitaTrack.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "VitaTrack.Api.dll"]
