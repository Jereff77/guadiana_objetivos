import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:drift/drift.dart' as drift;
import '../../data/datasources/local/database.dart';

class DashboardPage extends StatefulWidget {
  final String? warehouseId;
  const DashboardPage({super.key, this.warehouseId});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  bool _loading = false;

  int _totalItems = 0;
  int _itemsWithStock = 0;
  int _itemsWithNotes = 0;

  @override
  void initState() {
    super.initState();
    if (widget.warehouseId != null) {
      _loadMetrics();
    }
  }

  @override
  void didUpdateWidget(DashboardPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.warehouseId != oldWidget.warehouseId) {
      if (widget.warehouseId != null) {
        _loadMetrics();
      } else {
        setState(() {
          _totalItems = 0;
          _itemsWithStock = 0;
          _itemsWithNotes = 0;
        });
      }
    }
  }

  Future<void> _loadMetrics() async {
    setState(() => _loading = true);
    try {
      final warehouseId = widget.warehouseId!;
      final db = context.read<LocalDatabase>();

      // Helper to count
      Future<int> count(drift.Expression<bool> predicate) {
        final countExp = db.localInventory.productId.count();
        final query = db.selectOnly(db.localInventory)
          ..addColumns([countExp])
          ..where(
              db.localInventory.warehouseId.equals(warehouseId) & predicate);
        return query.map((row) => row.read(countExp)!).getSingle();
      }

      // Total items (predicate true)
      final totalRes = await count(const drift.Constant(true));

      // Items with stock > 0
      final stockRes =
          await count(db.localInventory.stock.isBiggerThanValue(0));

      // Items with notes
      final notesRes = await count(db.localInventory.notes.isNotNull() &
          db.localInventory.notes.equals('').not());

      if (mounted) {
        setState(() {
          _totalItems = totalRes;
          _itemsWithStock = stockRes;
          _itemsWithNotes = notesRes;
        });
      }
    } catch (e) {
      debugPrint('Error loading metrics: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.warehouseId == null) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.warehouse, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'Selecciona un almacén\npara ver el resumen',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 18, color: Colors.grey),
            ),
          ],
        ),
      );
    }

    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Resumen: ${widget.warehouseId}',
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              _buildMetricCard(
                context,
                icon: Icons.inventory_2,
                title: 'Total Artículos',
                value: '$_totalItems',
                color: const Color(0xFF004A93),
              ),
              _buildMetricCard(
                context,
                icon: Icons.check_circle,
                title: 'Con Existencia',
                value: '$_itemsWithStock',
                color: Colors.green,
              ),
              _buildMetricCard(
                context,
                icon: Icons.note,
                title: 'Con Notas',
                value: '$_itemsWithNotes',
                color: Colors.orange,
              ),
              _buildMetricCard(
                context,
                icon: Icons.percent,
                title: 'Avance',
                value: _totalItems > 0
                    ? '${((_itemsWithStock / _totalItems) * 100).toStringAsFixed(1)}%'
                    : '0%',
                color: Colors.purple,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard(BuildContext context,
      {required IconData icon,
      required String title,
      required String value,
      required Color color}) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: color),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }
}
