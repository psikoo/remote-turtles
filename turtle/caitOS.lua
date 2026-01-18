local args = { ... }
local pasteCode = args[1]
local url = "https://pastebin.com/raw/" .. pasteCode

term.clear()
term.setCursorPos(1,1)
print("Fetching script from Pastebin" .. pasteCode)

local response = http.get(url)

if response then
  local sCode = response.readAll()
  response.close()
  local func, err = load(sCode)
  if func then
    print("Running CaitOS")
    local success, runErr = pcall(func)
    if not success then
      print("Runtime Error: " .. runErr)
    end
  else
    print("Syntax Error in script: " .. err)
  end
else
  print("Failed to download CaitOS")
end