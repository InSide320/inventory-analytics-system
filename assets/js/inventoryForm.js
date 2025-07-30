document.addEventListener('DOMContentLoaded', function () {
    const operationType = document.getElementById('operationType');
    const groupTo = document.getElementById('group-toWarehouseId');

    function updateVisibility() {
        const selected = operationType.value;
        const isMove = selected === 'moved';

        groupTo.style.display = isMove ? 'block' : 'none';
    }

    operationType.addEventListener('change', updateVisibility);
    updateVisibility();
});
