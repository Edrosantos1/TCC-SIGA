<?php
header('Content-Type: application/json');

// Mock de dados (apenas para testar)
$catalogItems = [
    ['id' => 1, 'type' => 'book', 'title' => 'Teste', 'author' => 'Autor Teste', 'year' => 2024, 'category' => 'Teste', 'description' => 'Descrição', 'cover' => null, 'available' => true],
    ['id' => 2, 'type' => 'book', 'title' => 'Outro Livro', 'author' => 'Outro Autor', 'year' => 2023, 'category' => 'Ficção', 'description' => 'Descrição 2', 'cover' => null, 'available' => false]
];

echo json_encode($catalogItems);