namespace StudenTodo.Client.Models;

public class EtudeSession
{
    public DateTime Date { get; set; } = DateTime.Now;
    public TimeSpan Duree { get; set; } = TimeSpan.Zero;
}