INSERT INTO products (id, sku, name, category, unit_price_cents, stock_quantity, low_stock_threshold, warehouse_zone, version)
VALUES
    ('prod-nvme-2tb', 'ARM-NVME-2048', 'SSD NVMe Enterprise 2TB Gen4', 'armazenamento', 129900, 14, 4, 'Corredor A-01', 0),
    ('prod-switch-24p', 'RED-SW24-10G', 'Switch Gerenciável 24P 10GbE', 'redes', 389000, 5, 3, 'Corredor R-04', 0),
    ('prod-ram-64gb', 'HRD-ECC-64G', 'Módulo RAM DDR5 ECC 64GB', 'hardware', 184000, 3, 4, 'Corredor H-02', 0),
    ('prod-ups-1500', 'HRD-UPS-1500', 'Nobreak Senoidal Rack 1500VA', 'hardware', 245000, 8, 3, 'Corredor H-07', 0),
    ('prod-ap-wifi7', 'RED-AP-W7', 'Access Point Corporativo Wi-Fi 7', 'redes', 159000, 11, 4, 'Corredor R-02', 0),
    ('prod-nas-4bay', 'ARM-NAS-4B', 'Storage NAS 4 Baias Hot-Swap', 'armazenamento', 429000, 2, 3, 'Corredor A-05', 0),
    ('prod-dock-tb4', 'PER-DOCK-TB4', 'Dock Station Thunderbolt 4 Dual 4K', 'perifericos', 112000, 9, 3, 'Corredor P-01', 0),
    ('prod-mech-kbd', 'PER-KBD-TKL', 'Teclado Mecânico Compacto Hot-Swap', 'perifericos', 48900, 18, 5, 'Corredor P-03', 0),
    ('prod-sfp-transceiver', 'RED-SFP-25G', 'Transceiver Óptico SFP28 25Gbps', 'redes', 39000, 0, 6, 'Corredor R-08', 0),
    ('prod-monitor-34', 'PER-MON-34UW', 'Monitor Ultrawide 34" IPS USB-C', 'perifericos', 299000, 6, 2, 'Corredor P-06', 0),
    ('prod-cpu-epyc', 'HRD-CPU-16C', 'Processador Servidor 16 Núcleos', 'hardware', 549000, 4, 2, 'Corredor H-01', 0),
    ('prod-hdd-16tb', 'ARM-HDD-16T', 'HD Corporativo 16TB 7200RPM CMR', 'armazenamento', 215000, 7, 3, 'Corredor A-03', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO system_movements (id, occurred_at, category, direction, title, details, sku, order_id, quantity_delta, amount_cents, source)
VALUES
    ('mov-seed-1', '2026-11-24T13:15:00Z', 'PEDIDO', 'SAIDA', 'Pedido PED-2026-1042 emitido', 'Núcleo Cloud São Paulo · Entrega same-day (sudeste).', NULL, 'PED-2026-1042', -2, 420120, 'MANUAL'),
    ('mov-seed-2', '2026-11-24T13:15:00Z', 'ESTOQUE', 'SAIDA', 'Baixa de estoque · Switch Gerenciável 24P 10GbE', 'Reserva confirmada para o pedido PED-2026-1042.', 'RED-SW24-10G', 'PED-2026-1042', -1, NULL, 'SISTEMA'),
    ('mov-seed-3', '2026-11-24T11:20:00Z', 'ESTOQUE', 'ENTRADA', 'Reposição recebida · Corredor A-01', 'Entrada de lote SSD NVMe Enterprise 2TB Gen4 na doca principal.', 'ARM-NVME-2048', NULL, 10, NULL, 'MANUAL'),
    ('mov-seed-4', '2026-11-23T18:40:00Z', 'PEDIDO', 'SAIDA', 'Pedido PED-2026-1039 emitido', 'Atlas Telecom Sul · Entrega express (sul).', NULL, 'PED-2026-1039', -2, 289332, 'MANUAL'),
    ('mov-seed-5', '2026-11-23T15:05:00Z', 'LOGISTICA', 'NEUTRO', 'Rastreamento sincronizado', 'Hub Regional (SUDESTE) atualizado para PED-2026-1042.', NULL, 'PED-2026-1042', NULL, NULL, 'SISTEMA')
ON CONFLICT (id) DO NOTHING;
