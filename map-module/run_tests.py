import sys
from pathlib import Path

# Add solver root to sys.path
solver_root = Path(__file__).resolve().parent
sys.path.insert(0, str(solver_root))

from tests.test_compatibility import test_filter_compatibility
from tests.test_prioritizer import test_sort_orders_by_priority
from tests.test_timeline_manager import test_timeline_manager_break_and_restock
from tests.test_optimize_endpoint import test_health, test_optimize_routes


def main():
    print("Running Python Solver test suite...")
    test_filter_compatibility()
    print("  [✓] test_filter_compatibility passed")
    test_sort_orders_by_priority()
    print("  [✓] test_sort_orders_by_priority passed")
    test_timeline_manager_break_and_restock()
    print("  [✓] test_timeline_manager_break_and_restock passed")
    test_health()
    print("  [✓] test_health passed")
    test_optimize_routes()
    print("  [✓] test_optimize_routes passed")
    print("All Python Solver tests PASSED successfully!")


if __name__ == "__main__":
    main()
