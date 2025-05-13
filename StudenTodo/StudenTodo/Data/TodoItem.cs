namespace StudenTodo.Data
{
    public class TodoItem
    {
        public Guid Id { get; set; }  // Identifiant unique
        public string Title { get; set; } = "";
        public string Priority { get; set; } = "Normale";
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime? CompletedAt { get; set; } // Nullable pour les tâches non terminées
        public string? Description { get; set; } // Nullable pour les tâches sans description

    }
}
