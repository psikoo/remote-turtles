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

local function send(ws, typeIn, statusIn, responseIn)
  log("SEND: "..typeIn, colors.purple)
  ws.send(textutils.serializeJSON({ type = typeIn, status = statusIn, response = responseIn }))
end

local function calculateFuel()
  return turtle.getFuelLevel().."/"..turtle.getFuelLimit()
end

local function calculateInventory()
  local inventory = {
    s1 = turtle.getItemDetail(1),
    s2 = turtle.getItemDetail(2),
    s3 = turtle.getItemDetail(3),
    s4 = turtle.getItemDetail(4),
    s5 = turtle.getItemDetail(5),
    s6 = turtle.getItemDetail(6),
    s7 = turtle.getItemDetail(7),
    s8 = turtle.getItemDetail(8),
    s9 = turtle.getItemDetail(9),
    s10 = turtle.getItemDetail(10),
    s11 = turtle.getItemDetail(11),
    s12 = turtle.getItemDetail(12),
    s13 = turtle.getItemDetail(13),
    s14 = turtle.getItemDetail(14),
    s15 = turtle.getItemDetail(15),
    s16 = turtle.getItemDetail(16)
  }
  return inventory
end

while true do
  local ws, err = http.websocket(wsUrl)
  if not ws then
    log("ERROR: "..err, colors.red)
  else
    log("CONNECTION: "..wsUrl, colors.green)
    local dataTable = {
      id = os.getComputerID(),
      fuel = calculateFuel(),
      slot = turtle.getSelectedSlot(),
      inventory = calculateInventory(),
    }
    send(ws, "handshake", true, dataTable)
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
            send(ws, "response", success, tostring(result))
          else
            send(ws, "response", false, "Error: "..tostring(catch))
          end
        elseif data.type == "fuel" and data.content then
          if data.content == "refuel" then
            turtle.refuel()
          end
          send(ws, "fuel", true, calculateFuel())
          send(ws, "inventory", true, calculateInventory())
        elseif data.type == "place" and data.content then
          if data.content == "forward" then
            turtle.place()
            local hasBlockF, dataF = turtle.inspect()
            local dataTable = { blockF = { name = dataF.name or "minecraft:air", color = dataF.mapColor or 0 } }
            send(ws, "place", true, "forward")
            send(ws, "world", true, dataTable)
          elseif data.content == "up" then
            turtle.placeUp()
            local hasBlockU, dataU = turtle.inspectUp()
            local dataTable = { blockU = { name = dataU.name or "minecraft:air", color = dataU.mapColor or 0 } }
            send(ws, "place", true, "up")
            send(ws, "world", true, dataTable)
          elseif data.content == "down" then
            turtle.placeDown()
            local hasBlockD, dataD = turtle.inspectDown()
            local dataTable = { blockD = { name = dataD.name or "minecraft:air", color = dataD.mapColor or 0 } }
            send(ws, "place", true, "down")
            send(ws, "world", true, dataTable)
          end
          send(ws, "inventory", true, calculateInventory())
        elseif data.type == "mine" and data.content then
          if data.content == "forward" then
            turtle.dig()
            local hasBlockF, dataF = turtle.inspect()
            local dataTable = { blockF = { name = dataF.name or "minecraft:air", color = dataF.mapColor or 0 } }
            send(ws, "dig", true, "forward")
            send(ws, "world", true, dataTable)
          elseif data.content == "up" then
            turtle.digUp()
            local hasBlockU, dataU = turtle.inspectUp()
            local dataTable = { blockU = { name = dataU.name or "minecraft:air", color = dataU.mapColor or 0 } }
            send(ws, "dig", true, "up")
            send(ws, "world", true, dataTable)
          elseif data.content == "down" then
            turtle.digDown()
            local hasBlockD, dataD = turtle.inspectDown()
            local dataTable = { blockD = { name = dataD.name or "minecraft:air", color = dataD.mapColor or 0 } }
            send(ws, "dig", true, "down")
            send(ws, "world", true, dataTable)
          end
          send(ws, "inventory", true, calculateInventory())
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
              send(ws, "move", true, "forward")
              send(ws, "world", true, dataTable)
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
              send(ws, "move", true, "back")
              send(ws, "world", true, dataTable)
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
              send(ws, "move", true, "up")
              send(ws, "world", true, dataTable)
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
              send(ws, "move", true, "down")
              send(ws, "world", true, dataTable)
            end
          end
          send(ws, "fuel", true, turtle.getFuelLevel().."/"..turtle.getFuelLimit())
          send(ws, "inventory", true, calculateInventory())
        elseif data.type == "turn" and data.content then
          if data.content == "left" then
            turtle.turnLeft()
            send(ws, "turn", true, "left")
          elseif data.content == "right" then
            turtle.turnRight()
            send(ws, "turn", true, "right")
          end
        elseif data.type == "slot" and data.content then
          turtle.select(data.content)
          send(ws, "slot", true, turtle.getSelectedSlot())
          send(ws, "inventory", true, calculateInventory())
        elseif data.type == "item" and data.content then
          if data.content == "drop" then
            turtle.drop()
          elseif data.content == "suck" then
            turtle.suck()
          elseif data.content == "craft" then
            turtle.craft()
          elseif string.find(data.content, "drop") then
            local quantity, tmpBool = string.gsub(data.content, "drop", "")
            turtle.drop(tonumber(quantity))
          elseif string.find(data.content, "suck") then
            local quantity, tmpBool = string.gsub(data.content, "suck", "")
            turtle.suck(tonumber(quantity))
          elseif string.find(data.content, "craft") then
            local quantity, tmpBool = string.gsub(data.content, "craft", "")
            turtle.craft(tonumber(quantity))
          end
          send(ws, "inventory", true, calculateInventory())
        end
        send(ws, "response", true, "ready")
      elseif event == "websocket_closed" then
        break
      end
    end
    log("ERROR: Connection closed", colors.red)
  end
  log("ERROR: Attempting reconnect", colors.red)
  os.sleep(5)
end