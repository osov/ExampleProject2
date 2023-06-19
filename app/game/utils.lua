local ____exports = {}
function ____exports.get_random_numbers(count)
    local list = {}
    do
        local i = 1
        while i <= count do
            list[#list + 1] = i
            i = i + 1
        end
    end
    do
        local i = 0
        while i < #list do
            local r = math.random(0, #list - 1)
            local tmp = list[r + 1]
            list[r + 1] = list[i + 1]
            list[i + 1] = tmp
            i = i + 1
        end
    end
    return list
end
return ____exports
