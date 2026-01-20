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
          ws.send(textutils.serializeJSON({ type = "response", status = true, response = "ready" }))

        elseif data.type == "move" and data.content then
          if data.content == "forward" then
            if turtle.forward() then
              local hasBlockF, dataF = turtle.inspect()
              local hasBlockU, dataU = turtle.inspectUp()
              local hasBlockD, dataD = turtle.inspectDown()
              turtle.turnLeft()
              local hasBlockL, dataL = turtle.inspect()
              turtle.turnLeft()
              turtle.turnLeft()
              local hasBlockR, dataR = turtle.inspect()
              turtle.turnLeft()
              local dataTable = {
                blockF = { name = dataF.name or "minecraft:air", color = dataF.mapColor or 0 },
                blockU = { name = dataU.name or "minecraft:air", color = dataU.mapColor or 0 },
                blockD = { name = dataD.name or "minecraft:air", color = dataD.mapColor or 0 },
                blockL = { name = dataL.name or "minecraft:air", color = dataL.mapColor or 0 },
                blockR = { name = dataR.name or "minecraft:air", color = dataR.mapColor or 0 }
              }
              ws.send(textutils.serializeJSON({ type = "move", status = true, response = "forward" }))
              ws.send(textutils.serializeJSON({
                type = "world",
                status = true,
                response = dataTable
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
              turtle.turnLeft()
              local hasBlockR, dataR = turtle.inspect()
              turtle.turnLeft()
              local dataTable = {
                blockB = { name = dataB.name or "minecraft:air", color = dataB.mapColor or 0 },
                blockU = { name = dataU.name or "minecraft:air", color = dataU.mapColor or 0 },
                blockD = { name = dataD.name or "minecraft:air", color = dataD.mapColor or 0 },
                blockL = { name = dataL.name or "minecraft:air", color = dataL.mapColor or 0 },
                blockR = { name = dataR.name or "minecraft:air", color = dataR.mapColor or 0 }
              }
              ws.send(textutils.serializeJSON({ type = "move", status = true, response = "back" }))
              ws.send(textutils.serializeJSON({
                type = "world",
                status = true,
                response = dataTable
              }))
            end
          elseif data.content == "up" then
            if turtle.up() then
              local hasBlockF, dataF = turtle.inspect()
              local hasBlockU, dataU = turtle.inspectUp()
              turtle.turnLeft()
              local hasBlockL, dataL = turtle.inspect()
              turtle.turnLeft()
              local hasBlockB, dataB = turtle.inspect()
              turtle.turnLeft()
              local hasBlockR, dataR = turtle.inspect()
              turtle.turnLeft()
              local dataTable = {
                blockF = { name = dataF.name or "minecraft:air", color = dataF.mapColor or 0 },
                blockB = { name = dataB.name or "minecraft:air", color = dataB.mapColor or 0 },
                blockU = { name = dataU.name or "minecraft:air", color = dataU.mapColor or 0 },
                blockL = { name = dataL.name or "minecraft:air", color = dataL.mapColor or 0 },
                blockR = { name = dataR.name or "minecraft:air", color = dataR.mapColor or 0 }
              }
              ws.send(textutils.serializeJSON({ type = "move", status = true, response = "up" }))
              ws.send(textutils.serializeJSON({
                type = "world",
                status = true,
                response = dataTable
              }))
            end
          elseif data.content == "down" then
            if turtle.down() then
              local hasBlockF, dataF = turtle.inspect()
              local hasBlockD, dataD = turtle.inspectDown()
              turtle.turnLeft()
              local hasBlockL, dataL = turtle.inspect()
              turtle.turnLeft()
              local hasBlockB, dataB = turtle.inspect()
              turtle.turnLeft()
              local hasBlockR, dataR = turtle.inspect()
              turtle.turnLeft()
              local dataTable = {
                blockF = { name = dataF.name or "minecraft:air", color = dataF.mapColor or 0 },
                blockB = { name = dataB.name or "minecraft:air", color = dataB.mapColor or 0 },
                blockD = { name = dataD.name or "minecraft:air", color = dataD.mapColor or 0 },
                blockL = { name = dataL.name or "minecraft:air", color = dataL.mapColor or 0 },
                blockR = { name = dataR.name or "minecraft:air", color = dataR.mapColor or 0 }
              }
              ws.send(textutils.serializeJSON({ type = "move", status = true, response = "down" }))
              ws.send(textutils.serializeJSON({
                type = "world",
                status = true,
                response = dataTable
              }))
            end
          end
          ws.send(textutils.serializeJSON({ type = "response", status = true, response = "ready" }))
        elseif data.type == "turn" and data.content then
          if data.content == "left" then
            turtle.turnLeft()
            ws.send(textutils.serializeJSON({ type = "turn", status = true, response = "left" }))
          elseif data.content == "right" then
            turtle.turnRight()
            ws.send(textutils.serializeJSON({ type = "turn", status = true, response = "right" }))
          end
          ws.send(textutils.serializeJSON({ type = "response", status = true, response = "ready" }))
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