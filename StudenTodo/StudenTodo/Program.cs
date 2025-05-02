// Importations des espaces de noms nécessaires
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StudenTodo.Client.Pages;
using StudenTodo.Components;
using StudenTodo.Components.Account;
using StudenTodo.Data;

// Création du WebApplicationBuilder qui configure les services et le pipeline HTTP
var builder = WebApplication.CreateBuilder(args);

// ==================== CONFIGURATION DE BLAZOR ====================
// Cette section configure les différents modes de rendu de Blazor

// AddRazorComponents est la méthode de base pour utiliser Blazor dans .NET 8
builder.Services.AddRazorComponents()
    // Configuration du mode InteractiveServer: permet aux composants de s'exécuter sur le serveur
    // et de communiquer avec le navigateur via SignalR.
    // C'est nécessaire pour les composants avec @rendermode InteractiveServer
    .AddInteractiveServerComponents()
    
    // Configuration du mode WebAssembly: permet aux composants de s'exécuter directement
    // dans le navigateur en utilisant WebAssembly. Nécessaire pour les composants
    // avec @rendermode InteractiveWebAssembly
    .AddInteractiveWebAssemblyComponents();
    
// NOTE: Dans Blazor .NET 8, vous pouvez utiliser les deux modes de rendu dans la même application.
// C'est ce qu'on appelle une application Blazor "hybride" ou "mixte"

builder.Services.AddCascadingAuthenticationState();
builder.Services.AddScoped<IdentityUserAccessor>();
builder.Services.AddScoped<IdentityRedirectManager>();
builder.Services.AddScoped<AuthenticationStateProvider, PersistingServerAuthenticationStateProvider>();

builder.Services.AddAuthorization();
builder.Services.AddAuthentication(options =>
    {
        options.DefaultScheme = IdentityConstants.ApplicationScheme;
        options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
    })
    .AddIdentityCookies();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddIdentityCore<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

builder.Services.AddSingleton<IEmailSender<ApplicationUser>, IdentityNoOpEmailSender>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseWebAssemblyDebugging();
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseAntiforgery();

// ==================== MAPPAGE DES COMPOSANTS BLAZOR ====================
// Cette section définit comment les composants Razor sont routés et configurés

// MapRazorComponents est la méthode principale pour configurer le routage des composants
// Le type générique <App> indique le composant racine de l'application
app.MapRazorComponents<App>()
    // POINT CLÉ: Cette méthode active le mode de rendu interactif côté serveur
    // Sans cette ligne, les composants utilisant @rendermode InteractiveServer généreraient une erreur
    // Elle permet la communication bidirectionnelle via SignalR entre le serveur et le client
    .AddInteractiveServerRenderMode()
    
    // Cette méthode active le mode de rendu WebAssembly
    // Elle permet l'exécution des composants directement dans le navigateur
    .AddInteractiveWebAssemblyRenderMode()
    
    // Ajoute l'assembly client (partie WebAssembly) à l'application
    // Cela permet d'utiliser les composants définis dans le projet Client
    .AddAdditionalAssemblies(typeof(StudenTodo.Client._Imports).Assembly);

// Configure les routes supplémentaires nécessaires aux composants d'authentification
// et de gestion des comptes (login, register, etc.)
app.MapAdditionalIdentityEndpoints();

app.Run();
