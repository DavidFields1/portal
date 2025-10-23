<script setup lang="ts">
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex gap-6">
            <!-- Tabla principal -->
            <div class="flex-1">
                <Card>
                    <CardContent class="p-0">
                        <div class="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <Skeleton class="h-4 w-16" />
                                        </TableHead>
                                        <TableHead>
                                            <Skeleton class="h-4 w-16" />
                                        </TableHead>
                                        <TableHead>
                                            <Skeleton class="h-4 w-16" />
                                        </TableHead>
                                        <TableHead>
                                            <Skeleton class="h-4 w-16" />
                                        </TableHead>
                                        <TableHead>
                                            <Skeleton class="h-4 w-16" />
                                        </TableHead>
                                        <TableHead>
                                            <Skeleton class="h-4 w-24" />
                                        </TableHead>
                                        <TableHead>
                                            <Skeleton class="h-4 w-24" />
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    <!-- Repetimos algunas filas para simular contenido -->
                                    <TableRow v-for="i in 8" :key="i">
                                        <TableCell>
                                            <Skeleton class="h-4 w-32" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton class="h-4 w-40" />
                                        </TableCell>
                                        <TableCell class="text-center">
                                            <Skeleton class="mx-auto h-5 w-20 rounded-full" />
                                        </TableCell>
                                        <TableCell class="text-right">
                                            <Skeleton class="ml-auto h-4 w-20" />
                                        </TableCell>
                                        <TableCell class="text-center">
                                            <Skeleton class="mx-auto h-4 w-10" />
                                        </TableCell>
                                        <TableCell class="text-center">
                                            <Skeleton class="mx-auto h-4 w-24" />
                                        </TableCell>
                                        <TableCell class="text-center">
                                            <Skeleton class="mx-auto h-4 w-24" />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>

                    <CardFooter class="flex items-center justify-between border-t px-6 py-4">
                        <Skeleton class="h-4 w-48" />
                        <div class="flex items-center space-x-2">
                            <Skeleton class="h-8 w-20 rounded-md" />
                            <Skeleton class="h-4 w-32" />
                            <Skeleton class="h-8 w-20 rounded-md" />
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <!-- Sidebar (Filtros) -->
            <div class="hidden w-72 flex-shrink-0 md:block">
                <Card class="sticky top-6">
                    <CardHeader>
                        <CardTitle>
                            <Skeleton class="h-5 w-24" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent class="flex flex-col gap-4">
                        <div class="flex flex-col gap-2">
                            <Skeleton class="h-4 w-28" />
                            <Skeleton class="h-9 w-full rounded-md" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <Skeleton class="h-4 w-28" />
                            <Skeleton class="h-9 w-full rounded-md" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <Skeleton class="h-4 w-40" />
                            <Skeleton class="h-9 w-full rounded-md" />
                            <Skeleton class="h-9 w-full rounded-md" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton class="h-9 w-full rounded-md" />
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
</template>