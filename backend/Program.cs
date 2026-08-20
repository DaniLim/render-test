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

// In-memory visit counter (resets on backend restart/redeploy).
var visitCount = 0;

app.MapPost("/api/visits", () =>
    Results.Ok(new { visits = Interlocked.Increment(ref visitCount) }));

app.MapGet("/api/visits", () =>
    Results.Ok(new { visits = Volatile.Read(ref visitCount) }));

// In-memory guestbook (resets on backend restart/redeploy).
var guestbook = new List<GuestbookEntry>();
var guestbookLock = new object();

app.MapGet("/api/guestbook", () =>
{
    lock (guestbookLock)
    {
        return Results.Ok(guestbook.OrderByDescending(e => e.CreatedAt).ToList());
    }
});

app.MapPost("/api/guestbook", (GuestbookRequest req) =>
{
    var message = req.Message?.Trim();
    if (string.IsNullOrWhiteSpace(message))
    {
        return Results.BadRequest(new { error = "Message is required." });
    }

    var name = string.IsNullOrWhiteSpace(req.Name) ? "Anonymous" : req.Name.Trim();
    if (name.Length > 40) name = name[..40];
    if (message.Length > 280) message = message[..280];

    var entry = new GuestbookEntry(Guid.NewGuid(), name, message, DateTimeOffset.UtcNow);

    lock (guestbookLock)
    {
        guestbook.Add(entry);
        if (guestbook.Count > 50)
        {
            guestbook.RemoveAt(0);
        }
    }

    return Results.Created($"/api/guestbook/{entry.Id}", entry);
});

app.Run();

record GuestbookEntry(Guid Id, string Name, string Message, DateTimeOffset CreatedAt);
record GuestbookRequest(string? Name, string? Message);
