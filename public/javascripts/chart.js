const ctx = document.getElementById('myChart');

// get data from server (先得到全部資料，之後再依照sort來改變資料顯示)
(async function () {

  if (!ctx) return

  try {
    // get user records data
    const recordsResponse = await fetch('/data/records')
    const records = await recordsResponse.json()
    const categoriesResponse = await fetch('/data/categories')
    let categories = await categoriesResponse.json()

    // 目前 帳目類型
    const selectCategory = document.getElementById('category').value

    // filter 類型
    if (selectCategory !== "ALL") {
      categories = categories.filter(cate => cate.name === selectCategory)
    }

    // create an array with each categories
    const recordsByCategories = []
    for (const cate of categories) {
      recordsByCategories.push({
        'name': cate.name,
        'id': cate._id,
        'items': [],
        'total': 0,
      })
    }
    // give each record a category name
    // push records to recordsByCategories
    for (const record of records) {
      for (const cate of recordsByCategories) {
        if (cate.id.toString() === record.categoryId.toString()) {
          cate.total += record.amount
          cate.items.push(record)
        }
      }
    }
    // 以下用data稱呼
    const data = recordsByCategories

    // 檢查total 是否為 0(目前會造成圖表不能顯示)
    // 之後在 options.plugins.tooltip.callbacks 裡面改回來０
    if (data.length === 1 && data[0].total === 0) {
      data[0].total = -1
    }

    // create chart
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Array.from(data, cate => cate.name),
        datasets: [{
          label: '$',
          data: Array.from(data, cate => cate.total),
          borderWidth: 3,
        }]
      },
      options: {
        plugins: {
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (context) {
                // get current data index 
                const index = context.dataIndex
                // current dataset's label
                const label = context.dataset.label || '';
                // current dataset's data (its an array), [0] is the value
                let total = context.dataset.data[index]
                // 檢查
                if (total === -1) {
                  total = 0
                }
                return label + " : " + total;
              }
            },
          },
          // 這需要使用 chart.js-plugin-labels外掛使用，script在 view/layout/main.hbs
          labels: {
            render: 'percentage',
            fontSize: 16,
            fontStyle: 'bold',
            fontColor: 'white',
            precision: 1,
            position: 'border',
            showZero: false,
            render: function (args) {
              // args will be something like:
              // { label: 'Label', value: 123, percentage: 50, index: 0, dataset: {...} }
              // 在上面把 value 0 設定為 -1 了，所以這邊檢查 -1
              if (args.value === -1) {
                return ''
              } else {
                return args.percentage + '%';
              }
              // return object if it is image
              // return { src: 'image.png', width: 16, height: 16 };
            },
          },
        }
      }
    });



  } catch (err) {
    console.log(err)
  }

})()