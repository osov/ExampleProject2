export function get_random_numbers(count: number) {
    const list: number[] = [];
    for (let i = 1; i <= count; i++) {
        list.push(i);
    }
    for (let i = 0; i < list.length; i++) {
        const r = math.random(0, list.length - 1);
        const tmp = list[r];
        list[r] = list[i];
        list[i] = tmp;
    }
    return list;
}