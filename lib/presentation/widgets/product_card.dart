import 'package:flutter/material.dart';

class ProductCard extends StatelessWidget {
  final Map<String, dynamic> product;
  final Map<String, dynamic>? inventory;

  const ProductCard({
    super.key,
    required this.product,
    required this.inventory,
  });

  @override
  Widget build(BuildContext context) {
    final systemQty = product['Existencia'] ?? 0;
    final physicalQty = product['ConteoFisico']; // Puede ser null
    final stockMin = product['StockMin'] ?? 0;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              product['Descripcion'] ?? product['ProductId'] ?? '',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Marca: ${product['Marca'] ?? ''}'),
                Text('Cat: ${product['Categoria'] ?? ''}'),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Sistema: $systemQty',
                        style: const TextStyle(color: Colors.grey)),
                    if (physicalQty != null)
                      Text(
                        'Físico: $physicalQty',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, color: Colors.blue),
                      )
                    else
                      const Text('Físico: -',
                          style: TextStyle(fontStyle: FontStyle.italic)),
                  ],
                ),
                if (physicalQty != null)
                  Text(
                    'Dif: ${physicalQty - systemQty}',
                    style: TextStyle(
                      color: (physicalQty - systemQty) == 0
                          ? Colors.green
                          : Colors.red,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
              ],
            ),
            if (systemQty is num && stockMin is num && systemQty <= stockMin)
              Container(
                margin: const EdgeInsets.only(top: 8),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'Stock Bajo',
                  style: TextStyle(color: Colors.white, fontSize: 12),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
