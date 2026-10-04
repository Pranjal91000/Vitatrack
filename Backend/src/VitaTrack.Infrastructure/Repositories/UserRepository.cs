using Microsoft.EntityFrameworkCore;
using VitaTrack.Core.Abstraction;
using VitaTrack.Core.Entities;
using VitaTrack.Infrastructure.Data;

namespace VitaTrack.Infrastructure.Repositories
{
    public class UserRepository(AppDbContext appDbContext) : IUserRepository
    {
        private readonly AppDbContext _appDbContext = appDbContext;

        public async Task<User?> GetByIdAsync(long userId, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        }

        public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Users
                .IgnoreQueryFilters()
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => !u.IsDeleted && u.Email.ToLower() == email.ToLower(), cancellationToken);
        }

        public async Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
        {
            return await _appDbContext.Users
                .IgnoreQueryFilters()
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => !u.IsDeleted && u.RefreshTokens.Any(t => t.Token == refreshToken), cancellationToken);
        }

        public async Task<User> CreateUserAsync(User user, CancellationToken cancellationToken = default)
        {
            await _appDbContext.Users.AddAsync(user, cancellationToken);
            await _appDbContext.SaveChangesAsync(cancellationToken);
            return user;
        }

        public async Task<bool> UpdateUserAsync(User user, CancellationToken cancellationToken = default)
        {
            _appDbContext.Users.Update(user);
            return await _appDbContext.SaveChangesAsync(cancellationToken) > 0;
        }
    }
}
