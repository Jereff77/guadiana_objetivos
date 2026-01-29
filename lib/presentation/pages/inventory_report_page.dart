import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class InventoryReportPage extends StatefulWidget {
  final String sessionId;
  final String sessionName;
  final String warehouseId;

  const InventoryReportPage({
    super.key,
    required this.sessionId,
    required this.sessionName,
    required this.warehouseId,
  });

  @override
  State<InventoryReportPage> createState() => _InventoryReportPageState();
}

class _InventoryReportPageState extends State<InventoryReportPage> {
  bool _loading = true;
  List<Map<String, dynamic>> _reportData = [];
  String? _error;

  // Totales
  int _totalSystem = 0;
  int _totalPhysical = 0;
  int _totalDiff = 0;

  @override
  void initState() {
    super.initState();
    _loadReport();
  }

  Future<void> _loadReport() async {
    try {
      final client = Supabase.instance.client;

      // 1. Obtener conteos de la sesión
      final countsResponse = await client
          .from('conteo_inventario')
          .select()
          .eq('session_id', widget.sessionId);

      final counts = List<Map<String, dynamic>>.from(countsResponse);

      if (counts.isEmpty) {
        if (mounted) {
          setState(() {
            _loading = false;
          });
        }
        return;
      }

      // 2. Obtener IDs de productos
      final productIds = counts.map((c) => c['product_id']).toList();

      // 3. Obtener detalles de productos (Nombre/Descripción)
      // Como no tenemos FK explícita, hacemos una consulta "IN"
      // Nota: Si son muchos productos, podría ser necesario paginar,
      // pero para este caso de uso asumimos que cabe en una query.
      final productsResponse = await client
          .from('inventario')
          .select('ProductId, Descripcion')
          .eq('Almacen', widget.warehouseId)
          .filter('ProductId', 'in', productIds);

      final productsMap = {
        for (var p in (productsResponse as List))
          p['ProductId'].toString(): p['Descripcion']
      };

      // 4. Construir reporte
      List<Map<String, dynamic>> report = [];
      int tSys = 0;
      int tPhy = 0;
      int tDiff = 0;

      for (var count in counts) {
        final pid = count['product_id'];
        final systemStock = (count['system_stock'] as num?)?.toInt() ?? 0;
        final physicalStock = (count['quantity'] as num?)?.toInt() ?? 0;
        final diff = physicalStock - systemStock;

        tSys += systemStock;
        tPhy += physicalStock;
        tDiff += diff;

        report.add({
          'productId': pid,
          'description': productsMap[pid] ?? 'Producto Desconocido',
          'systemStock': systemStock,
          'physicalStock': physicalStock,
          'difference': diff,
          'notes': count['notes'],
        });
      }

      // Ordenar por diferencia (primero las discrepancias)
      report.sort((a, b) {
        // Valor absoluto de diferencia descendente
        return (b['difference'] as int)
            .abs()
            .compareTo((a['difference'] as int).abs());
      });

      if (mounted) {
        setState(() {
          _reportData = report;
          _totalSystem = tSys;
          _totalPhysical = tPhy;
          _totalDiff = tDiff;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.sessionName),
      ),
      body: Column(
        children: [
          // Resumen
          Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStat('Sistema', _totalSystem.toString(), Colors.blue),
                  _buildStat(
                      'Físico', _totalPhysical.toString(), Colors.purple),
                  _buildStat(
                      'Diferencia',
                      (_totalDiff > 0
                          ? '+${_totalDiff}'
                          : _totalDiff.toString()),
                      _totalDiff == 0 ? Colors.green : Colors.red),
                ],
              ),
            ),
          ),

          // Lista
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(child: Text('Error: $_error'))
                    : _reportData.isEmpty
                        ? const Center(
                            child: Text('No hay datos en este inventario.'))
                        : ListView.separated(
                            itemCount: _reportData.length,
                            separatorBuilder: (ctx, i) =>
                                const Divider(height: 1),
                            itemBuilder: (context, index) {
                              final item = _reportData[index];
                              final diff = item['difference'] as int;
                              final isZeroDiff = diff == 0;

                              return ListTile(
                                title: Text(
                                  item['description'],
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('ID: ${item['productId']}'),
                                    if (item['notes'] != null &&
                                        item['notes'].toString().isNotEmpty)
                                      Text('Nota: ${item['notes']}',
                                          style: const TextStyle(
                                              fontStyle: FontStyle.italic)),
                                  ],
                                ),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.end,
                                      children: [
                                        Text('Sis: ${item['systemStock']}',
                                            style: const TextStyle(
                                                fontSize: 12,
                                                color: Colors.grey)),
                                        Text('Fís: ${item['physicalStock']}',
                                            style: const TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                    const SizedBox(width: 16),
                                    Container(
                                      width: 40,
                                      alignment: Alignment.centerRight,
                                      child: Text(
                                        diff > 0 ? '+$diff' : '$diff',
                                        style: TextStyle(
                                          color: isZeroDiff
                                              ? Colors.green
                                              : Colors.red,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildStat(String label, String value, Color color) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        Text(
          value,
          style: TextStyle(
              fontSize: 20, fontWeight: FontWeight.bold, color: color),
        ),
      ],
    );
  }
}
