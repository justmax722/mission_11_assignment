using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mission11.API.Data;

namespace Mission11.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly BookstoreDbContext _context;

        public BooksController(BookstoreDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<Books>>> GetBooks(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 5,
            [FromQuery] string? category = null)
        {
            if (pageNumber < 1)
            {
                pageNumber = 1;
            }

            const int maxPageSize = 50;
            if (pageSize < 1)
            {
                pageSize = 5;
            }
            else if (pageSize > maxPageSize)
            {
                pageSize = maxPageSize;
            }

            var query = _context.Books.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(b => b.Category == category);
            }

            query = query.OrderBy(b => b.BookID);

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = new PagedResult<Books>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            return Ok(result);
        }

        [HttpGet("categories")]
        public async Task<ActionResult<IReadOnlyList<string>>> GetCategories()
        {
            var categories = await _context.Books
                .AsNoTracking()
                .Select(b => b.Category)
                .Where(c => !string.IsNullOrWhiteSpace(c))
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(categories);
        }
    }
}