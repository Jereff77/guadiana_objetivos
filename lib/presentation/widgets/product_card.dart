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
    final qty = inventory?['Existencia'] ?? 0;
    final stockMin = product['StockMin'] ?? 0;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              product['Producto'] ?? '',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(product['Descripcion'] ?? ''),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Marca: ${product['Marca'] ?? ''}'),
                Text('Modelo: ${product['Modelo'] ?? ''}'),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('ProductoId: ${product['ProductId'] ?? ''}'),
                Text('Stock: $qty'),
              ],
            ),
            if (qty is num && stockMin is num && qty <= stockMin)
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
