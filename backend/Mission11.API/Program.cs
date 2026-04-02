using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Mission11.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<BookstoreDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("BookstoreConnection")));

// CORS (see step 5 below)
const string AllowFrontendPolicy = "AllowFrontend";

// Local dev default: http://localhost:5173
// Deployment: configure `Cors:AllowedOrigins` (string array) or `CORS_ALLOWED_ORIGINS`
// (comma/semicolon separated).
var allowedOrigins =
    builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ??
    Array.Empty<string>();

if (allowedOrigins.Length == 0)
{
    var raw = builder.Configuration["CORS_ALLOWED_ORIGINS"];
    if (!string.IsNullOrWhiteSpace(raw))
    {
        allowedOrigins = raw
            .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim())
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .ToArray();
    }
}

// Ensure known front-end origins are always allowed, while still honoring configured origins.
var fallbackOrigins = new[]
{
    "http://localhost:5173",
    "https://lively-dune-0f9f0281e.2.azurestaticapps.net"
};

if (allowedOrigins.Length == 0)
{
    allowedOrigins = fallbackOrigins;
}
else
{
    // merge configured origins and known allowed origins, removing duplicates.
    allowedOrigins = allowedOrigins
        .Concat(fallbackOrigins)
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToArray();
}

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: AllowFrontendPolicy, policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors(AllowFrontendPolicy);

app.UseAuthorization();

app.MapControllers();

// Ensure the SQLite database schema exists on startup.
// This prevents runtime failures after deployment when EF migrations are not used.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BookstoreDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
