using VitaTrack.Core.Entities;

namespace VitaTrack.Core.Abstraction
{
    public interface IFoodRepository
    {
        Task<List<Food>> SearchFoodsAsync(string search, int limit, CancellationToken cancellationToken = default);
        Task<Food?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
        Task<Food> CreateFoodAsync(Food food, CancellationToken cancellationToken = default);
        Task<bool> UpdateFoodAsync(Food food, CancellationToken cancellationToken = default);
        Task<bool> DeleteFoodAsync(Food food, CancellationToken cancellationToken = default);
    }
}
