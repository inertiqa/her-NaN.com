local posts_dir = "./entries"
local output_file = "index.html"

-- Escapar caracteres especiales de HTML
local function escape_html(str)
    local map = { ['&'] = '&amp;', ['<'] = '&lt;', ['>'] = '&gt;', ['"'] = '&quot;', ["'"] = '&#39;' }
    return str:gsub('[&<>"\']', map)
end

-- Windows: usa 'dir /b'
local handle = io.popen('ls "' .. posts_dir .. '"')
if not handle then
    print("Error abriendo el directorio " .. posts_dir)
    return
end

local files = {}
for file in handle:lines() do
    if file:match("%.txt$") or file:match("%.md$") then
        table.insert(files, file)
    end
end
handle:close()

-- Ordenar archivos descendentemente
table.sort(files, function(a, b) return a > b end)

local html_posts = {}

for _, file in ipairs(files) do
    local f = io.open(posts_dir .. "/" .. file, "r")
    if f then
        local contenido = f:read("*a")
        f:close()

        local titulo = file:gsub("%.%w+$", ""):gsub("-", " ")
        local post_html = string.format([[
        <article class="post">
            <time>%s</time>
            <div class="contenido">%s</div>
        </article>]], escape_html(titulo), escape_html(contenido))

        table.insert(html_posts, post_html)
    end
end

-- Guardar resultado en index.html
local out = io.open(output_file, "w")
if out then
    out:write([[<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Microblog</title>
</head>
<body>
    <input type="text" id="buscador" placeholder="Buscar entradas...">
    <main id="contenedor-posts">
]])
    out:write(table.concat(html_posts, "\n"))
    out:write([[
    </main>
    <script>
        const buscador = document.getElementById('buscador');
        const posts = document.querySelectorAll('.post');
        buscador.addEventListener('input', (e) => {
            const t = e.target.value.toLowerCase();
            posts.forEach(p => p.style.display = p.textContent.toLowerCase().includes(t) ? 'block' : 'none');
        });
    </script>
</body>
</html>]])
    out:close()
    print(output_file .. " created")
end
