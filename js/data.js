let data = null;
let series = null;
let data_file = './data/result.csv';

function get_min_max(data, attr) {
    let min = 1e9;
    let max = 0;
    data.forEach(d => {
        let v = parseInt(d[attr]);
        if (v > max)
            max = v;
        if (v < min)
            min = v;
    });
    console.log('attr', attr, 'min', min, 'max', max);

    return [min, max];
}

function get_set(data, attr) {
    let set = [];
    data.forEach(d => {
        let v = d[attr];
        set.push(v);
    })

    return set;
}

function createSlider(sliderId, values, displayId) {
    let slider = d3.select(sliderId)
        .attr('min', 0)
        .attr('max', values.length - 1)
        .attr('value', 0)
        .on('input', function() {
            let value = values[this.value];
            d3.select(displayId).text(value);
        });

    d3.select(displayId).text(values[0]);
}

