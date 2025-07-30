document.addEventListener('DOMContentLoaded', function () {
    const operationType = document.getElementById('operationType');
    const groupTo = document.getElementById('group-toWarehouseId');
    const fromSelect = document.getElementById('fromLocation');
    const toSelect = document.getElementById('toWarehouseId');

    function updateVisibility() {
        const selected = operationType.value;
        const isMove = selected === 'moved';
        groupTo.style.display = isMove ? 'block' : 'none';
    }

    function updateToWarehouses() {
        if (!fromSelect || !toSelect) return;

        const selectedFrom = fromSelect.value;

        for (let option of toSelect.options) {
            if (option.value === "" || option.value !== selectedFrom) {
                option.hidden = false;
            } else {
                option.hidden = true;
                if (toSelect.value === selectedFrom) {
                    toSelect.value = "";
                }
            }
        }
    }

    if (operationType) {
        operationType.addEventListener('change', updateVisibility);
        updateVisibility();
    }

    if (fromSelect && toSelect) {
        fromSelect.addEventListener('change', updateToWarehouses);
        updateToWarehouses();
    }
});
