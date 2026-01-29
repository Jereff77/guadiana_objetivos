import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import 'inventory_report_page.dart';

class InventoryHistoryPage extends StatefulWidget {
  const InventoryHistoryPage({super.key});

  @override
  State<InventoryHistoryPage> createState() => _InventoryHistoryPageState();
}

class _InventoryHistoryPageState extends State<InventoryHistoryPage> {
  bool _loading = true;
  List<Map<String, dynamic>> _sessions = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    try {
      final client = Supabase.instance.client;

      // Obtener sesiones ordenadas por fecha (más recientes primero)
      final response = await client
          .from('inventory_sessions')
          .select()
          .order('created_at', ascending: false);

      if (mounted) {
        setState(() {
          _sessions = List<Map<String, dynamic>>.from(response);
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
        title: const Text('Historial de Inventarios'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error'))
              : _sessions.isEmpty
                  ? const Center(child: Text('No hay inventarios registrados.'))
                  : ListView.builder(
                      itemCount: _sessions.length,
                      itemBuilder: (context, index) {
                        final session = _sessions[index];
                        final date =
                            DateTime.parse(session['created_at']).toLocal();
                        final closedAt = session['closed_at'] != null
                            ? DateTime.parse(session['closed_at']).toLocal()
                            : null;
                        final status = session['status'] ?? 'active';
                        final isClosed = status == 'closed';
                        final warehouseId = session['warehouse_id'];

                        return Card(
                          margin: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 8),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor:
                                  isClosed ? Colors.green : Colors.orange,
                              child: Icon(
                                isClosed ? Icons.check : Icons.edit,
                                color: Colors.white,
                              ),
                            ),
                            title: Text(session['name'] ?? 'Sin nombre'),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Almacén: $warehouseId'),
                                Text(
                                    'Creado: ${DateFormat('dd/MM/yyyy HH:mm').format(date)}'),
                                if (isClosed && closedAt != null)
                                  Text(
                                      'Cerrado: ${DateFormat('dd/MM/yyyy HH:mm').format(closedAt)}',
                                      style: const TextStyle(
                                          fontSize: 12, color: Colors.grey)),
                              ],
                            ),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => InventoryReportPage(
                                    sessionId: session['id'],
                                    sessionName:
                                        session['name'] ?? 'Inventario',
                                    warehouseId: warehouseId,
                                  ),
                                ),
                              );
                            },
                          ),
                        );
                      },
                    ),
    );
  }
}
