using Microsoft.EntityFrameworkCore;

namespace VitaTrack.Api.Common.Models;

public class PaginatedList<T>
{
    public List<T> Items { get; }
    public int PageNumber { get; }
    public int TotalPages { get; }
    public int TotalCount { get; }
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public PaginatedList(List<T> items, int count, int pageNumber, int pageSize)
    {
        PageNumber = pageNumber;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        TotalCount = count;
        Items = items;
    }

    public static async Task<PaginatedList<T>> CreateAsync(IQueryable<T> source, int pageNumber, int pageSize)
    {
        var count = await source.CountAsync();
        var items = await source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
        return new PaginatedList<T>(items, count, pageNumber, pageSize);
    }
}

public class ResponseMeta
{
    public int Total { get; set; }
    public int Page { get; set; }
    public int TotalPages { get; set; }
    public bool HasNext { get; set; }

    public static ResponseMeta FromPagination<T>(PaginatedList<T> list) => new ResponseMeta
    {
        Total = list.TotalCount,
        Page = list.PageNumber,
        TotalPages = list.TotalPages,
        HasNext = list.HasNextPage
    };
}

public class ApiResponse<T>
{
    public T Data { get; set; }
    public ResponseMeta? Meta { get; set; }

    public ApiResponse(T data, ResponseMeta? meta = null)
    {
        Data = data;
        Meta = meta;
    }
}
