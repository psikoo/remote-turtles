term.setTextColor(colors.purple)
print("")
print("---------------------------------------")
print("")
print("                caitOS                 ")
print("")
print("---------------------------------------")
print("")
term.setTextColor(colors.white)

local wsUrl = "ws://127.0.0.1:8080"

local function log(str, color)
  term.setTextColor(color)
  print(str)
  term.setTextColor(colors.white)
end

while true do
  local ws, err = http.websocket(wsUrl)
  if not ws then
    log("ERROR: "..err, colors.red)
  else
    log("CONNECTION: "..wsUrl, colors.green)
    ws.send(textutils.serializeJSON({ type = "handshake", id = os.getComputerID() }))
    while true do
      local event, url, message = os.pullEvent()
      if event == "websocket_message" then
        local data = textutils.unserializeJSON(message)
        log("WS: ("..data.type..") "..data.content, colors.purple)
        if data.type == "eval" and data.content then
          log("> "..data.content, colors.purple)
          local func, catch = load("return "..data.content)
          if func then
            local success, result = pcall(func)
            ws.send(textutils.serializeJSON({ type = "response", status = success, response = tostring(result) }))
          else
            ws.send(textutils.serializeJSON({ type = "response", status = false, response = "Error: "..tostring(catch) }))
          end
        elseif data.type == "move" and data.content then
          if data.content == "forward" then
            if turtle.forward() then
              local hasBlockF, dataF = turtle.inspect()
              local hasBlockU, dataU = turtle.inspectUp()
              local hasBlockD, dataD = turtle.inspectDown()
              turtle.turnLeft()
              local hasBlockL, dataL = turtle.inspect()
              turtle.turnRight()
              turtle.turnRight()
              local hasBlockR, dataR = turtle.inspect() 
              turtle.turnLeft()
              local dataTable = {
                blockF = dataF.name,
                blockU = dataU.name,
                blockD = dataD.name,
                blockL = dataL.name,
                blockR = dataR.name
              }
              ws.send(textutils.serializeJSON({ 
                type = "world", 
                status = true, 
                response = JSONEncode(dataTable)
              }))
            end
          elseif data.content == "back" then
            if turtle.back() then
              local hasBlockU, dataU = turtle.inspectUp()
              local hasBlockD, dataD = turtle.inspectDown()
              turtle.turnLeft()
              local hasBlockL, dataL = turtle.inspect()
              turtle.turnLeft()
              local hasBlockB, dataB = turtle.inspect()
              turtle.turnRight()
              turtle.turnRight()
              turtle.turnRight()
              local hasBlockR, dataR = turtle.inspect() 
              turtle.turnLeft()
              local dataTable = {
                blockF = dataB.name,
                blockU = dataU.name,
                blockD = dataD.name,
                blockL = dataL.name,
                blockR = dataR.name
              }
              ws.send(textutils.serializeJSON({ 
                type = "world", 
                status = true, 
                response = JSONEncode(dataTable)
              }))
            end
          end
        end
      elseif event == "websocket_closed" then
        break
      end
    end
    log("ERROR: Connection closed", colors.red)
  end
  log("ERROR: Attempting reconnect", colors.red)
  os.sleep(5)
end