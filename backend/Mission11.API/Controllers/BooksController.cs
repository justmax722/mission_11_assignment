using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
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

        public class CreateBookRequest
        {
            [Required]
            public string Title { get; set; } = string.Empty;
            [Required]
            public string Author { get; set; } = string.Empty;
            [Required]
            public string Publisher { get; set; } = string.Empty;
            [Required]
            public string ISBN { get; set; } = string.Empty;
            [Required]
            public string Classification { get; set; } = string.Empty;
            [Required]
            public string Category { get; set; } = string.Empty;
            [Required]
            public int PageCount { get; set; }
            [Required]
            public decimal Price { get; set; }
        }

        public class UpdateBookRequest
        {
            [Required]
            public string Title { get; set; } = string.Empty;
            [Required]
            public string Author { get; set; } = string.Empty;
            [Required]
            public string Publisher { get; set; } = string.Empty;
            [Required]
            public string ISBN { get; set; } = string.Empty;
            [Required]
            public string Classification { get; set; } = string.Empty;
            [Required]
            public string Category { get; set; } = string.Empty;
            [Required]
            public int PageCount { get; set; }
            [Required]
            public decimal Price { get; set; } = 0m;
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

        [HttpGet("all")]
        public async Task<ActionResult<IReadOnlyList<Books>>> GetAllBooks()
        {
            var books = await _context.Books
                .AsNoTracking()
                .OrderBy(b => b.BookID)
                .ToListAsync();

            return Ok(books);
        }

        [HttpPost]
        public async Task<ActionResult<Books>> CreateBook([FromBody] CreateBookRequest request)
        {
            var entity = new Books
            {
                Title = request.Title,
                Author = request.Author,
                Publisher = request.Publisher,
                ISBN = request.ISBN,
                Classification = request.Classification,
                Category = request.Category,
                PageCount = request.PageCount,
                Price = request.Price
            };

            _context.Books.Add(entity);
            await _context.SaveChangesAsync();

            return StatusCode(StatusCodes.Status201Created, entity);
        }

        [HttpPut("{bookId:int}")]
        public async Task<ActionResult<Books>> UpdateBook(int bookId, [FromBody] UpdateBookRequest request)
        {
            var entity = await _context.Books.FirstOrDefaultAsync(b => b.BookID == bookId);
            if (entity == null)
            {
                return NotFound();
            }

            entity.Title = request.Title;
            entity.Author = request.Author;
            entity.Publisher = request.Publisher;
            entity.ISBN = request.ISBN;
            entity.Classification = request.Classification;
            entity.Category = request.Category;
            entity.PageCount = request.PageCount;
            entity.Price = request.Price;

            await _context.SaveChangesAsync();
            return Ok(entity);
        }

        [HttpDelete("{bookId:int}")]
        public async Task<IActionResult> DeleteBook(int bookId)
        {
            var entity = await _context.Books.FirstOrDefaultAsync(b => b.BookID == bookId);
            if (entity == null)
            {
                return NotFound();
            }

            _context.Books.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
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