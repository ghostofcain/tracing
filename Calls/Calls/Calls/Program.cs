static async Task CallService(int orderId)
{
    using var client = new HttpClient();
    var result = await client.GetAsync($"http://localhost:3000/order/{orderId}");
    Console.WriteLine($"OrderId={orderId}, StatusCode={result.StatusCode}");
}

await Parallel.ForEachAsync(Enumerable.Range(10, 10000),
     new ParallelOptions { MaxDegreeOfParallelism = 32 },
    async (i, CancellationToken) =>
    {
        await CallService(i);
    });