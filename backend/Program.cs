var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader());
});

// Render sets PORT; bind to it explicitly so the container is reachable.
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();

app.MapGet("/", () => Results.Ok(new { message = "Hello from the .NET backend!" }));

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.MapGet("/api/hello", (string? name) =>
    Results.Ok(new { message = $"Hello, {name ?? "World"}!", timestamp = DateTimeOffset.UtcNow }));

app.Run();
