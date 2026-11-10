local base_dir = "/home/inertiqa/Documents/Codeberg/her-nan.com"
local posts_dir = base_dir .. "/plan/entries"
local output_file = base_dir .. "/plan/index.html"
local js_file = base_dir .. "/assets/scripts.js"
local zip_file = base_dir .. "/plan/her-nan.zip"

-- Escapar caracteres especiales de HTML
local function escape_html(str)
    local map = { ['&'] = '&amp;', ['<'] = '&lt;', ['>'] = '&gt;', ['"'] = '&quot;', ["'"] = '&#39;' }
    return str:gsub('[&<>"\']', map)
end

-- .plan
local handle_plan = io.popen('ls "' .. posts_dir .. '"')
local plan_files = {}

if handle_plan then
    for file in handle_plan:lines() do
        if file:match("%.plan$") then
            table.insert(plan_files, file)
        end
    end
    handle_plan:close()
end

table.sort(plan_files, function(a, b) return a > b end)
local last_plan = plan_files[1]
local f_path = posts_dir .. "/" .. last_plan

-- 3 words for last entry
local p_file = io.open(f_path, "r")
local plan_content = p_file:read("*a")
p_file:close()

-- clean no alphanumerics
local clean_plan = plan_content:gsub("[^%w%s]", " "):gsub("%s+", " "):match("^%s*(.-)%s*$")

local w1, w2, w3 = clean_plan:match("(%S+)%s+(%S+)%s+(%S+)")
local plan_title = (w1 and w2 and w3) and (w1 .. " " .. w2 .. " " .. w3) or clean_plan

-- timestamp
local date_cmd = string.format('date -r "%s" +"%%Y-%%m-%%dT%%H:%%M:%%S%%z"', f_path)
local d_handle = io.popen(date_cmd)
local plan_date = ""

if d_handle then
    local out_date = d_handle:read("*l") or ""
    d_handle:close()
    plan_date = out_date:gsub("(%+%d%d)(%d%d)$", "%1:%2")
end

-- update index in assets/scripts.js
local js_in = io.open(js_file, "r")
if js_in then
    local js_content = js_in:read("*a")
    js_in:close()

    local new_nerd_line = string.format(
        "\n        'the last thing on the log is: <a href=\"/plan/\" title=\"last entry: %s\" target=\"_self\">%s</a> (<span data-uid=\"%s\"></span>)'",
        escape_html(plan_title),
        escape_html(plan_title),
        escape_html(plan_date)
    )

    local updated_js = js_content:gsub("%s*'And the last thing on the log is:.-%'%s*,?", new_nerd_line)

    local js_out = io.open(js_file, "w")
    if js_out then
        js_out:write(updated_js)
        js_out:close()
        print(js_file .. " js updated")
    end
end

-- get .plan files
local handle_posts = io.popen('ls "' .. posts_dir .. '"')
if not handle_posts then
    print("Error opening the directory " .. posts_dir)
    return
end

local files = {}
for file in handle_posts:lines() do
    if file:match("%.plan$") then
        table.insert(files, file)
    end
end
handle_posts:close()

table.sort(files, function(a, b) return a > b end)

local html_posts = {}
for _, file in ipairs(files) do
    local f = io.open(posts_dir .. "/" .. file, "r")
    if f then
        local contenido = f:read("*a")
        f:close()

		local titulo = file:match("(%d%d%d%d%d%d%d%d)") or file:gsub("%.plan$", "")

		local details_tag = (_ == 1) and "<details open>" or "<details>"

        local post_html = string.format([[%s
<summary><h2>%s</h2></summary>
<pre class="plain">%s</pre>
</details>
]], details_tag, (titulo), escape_html(contenido))

        table.insert(html_posts, post_html)
    end
end

-- create .plan archive
local out = io.open(output_file, "w")
if out then
    out:write([[<!doctype html>
<html lang="en">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8">
		<meta name="author" content="inertiqa" />
		<title>inertiqa .plan</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta name="description" content="index">
		<meta name="revised" content="Tuesday, October 06th, 2026, 01:14:50 am" />
		<link rel="icon" type="image/png" href="/assets/favicon.png">

		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Raleway:wght@100..900&display=swap" rel="stylesheet">
		<link rel="preload" href="/assets/style.css" as="style" />
		<link rel="stylesheet" href="/assets/style.css" layer="base">
		<link rel="preload" href="/assets/stylePlan.css" as="style" />
		<link rel="stylesheet" href="/assets/stylePlan.css" layer="plan">

		<script src="/assets/scripts.js"></script>
	</head>

    <body>
		<div class="layout plan">
			<header name="top">
				<h1><a href="\" target="_self" title="back to the index">./</a>Inertiqa .plan<span class="skyEmoji">🖋</span></h1>
			</header>

			<main>
<details>
<summary><h2 style="color:red">q&a</h2></summary>
<pre class="plain">
"As life in the war room pressed on, Carmack took it upon himself to let gamers know that, yes, id really was moving along with its work on Quake. So he decided to upload his daily work log, or, as it was known, a .plan file, to the Internet. Plan files were often used by programmers to keep each other informed of their efforts but had yet to be exploited as means of communicating with the masses."

- From the book "Masters of Doom"

---------------------------------

After years of failing to produce some kind of blog writting consistency myself, I started to suspect that the bare reason why everyone mostly fails is because the barrier to write is too high, us programmers have our blogs running nonstop for decades in state of complete ruin as the consistency dissipates with generators, transpilations, hydration strategies, personalizations, deployments, it keeps getting worse by the year.

Carmack didn't needed more than pure text files ten years straight.

The only change to the Carmack original .plan files is that mine is a write-once file log. Completed / abandoned stuff will be written on later date files. Search for it.

Any section can be empty, not all sections can be empty.

* completed tasks</li>
+ future tasks / ideas</li>
- abandoned tasks / ideas</li>
(no prefix) rants</li>
</pre>
</details>
]])
    out:write(table.concat(html_posts, "\n"))
    out:write([[
    		</main>

		<footer>
			<ul class="footer">
				<li><a href="/" title="back to the index" target="_self">index</a></li>
				<li><a href="/design/" title="design" target="_self">design</a></li>
				<li><a href="https://codeberg.org/inertiqa" title="follow my adventures on Codeberg" target="_blank">codeberg</a></li>
				<li><a href="https://github.com/inertiqa" title="follow my adventures on Github" target="_blank">github</a></li>
				<li><a href="#top" title="back to top" target="_self">back to top &uuarr;</a></li>
			</ul>
		</footer>

        </div>
	</body>
</html>
]])
    out:close()
    print(output_file .. " OK")
end

-- zip all .plan files
local zip_cmd = string.format('zip -r "%s" "%s"', zip_file, posts_dir)
local result = os.execute(zip_cmd)

if result then
    print("OK: " .. zip_file)
else
    print("KO: ")
end
