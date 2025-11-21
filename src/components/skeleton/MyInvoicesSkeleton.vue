<script setup lang="ts">
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="flex gap-6">
    <!-- Columna principal (tabla skeleton) -->
    <div class="flex-1">
      <Card>
        <CardHeader>
          <div class="h-6 w-32">
            <Skeleton class="h-6 w-32" />
          </div>
        </CardHeader>
        
        <CardContent class="p-0">
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead v-for="i in 7" :key="i">
                    <Skeleton class="h-4 w-20" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <!-- Filas de skeleton simulando facturas -->
                <TableRow v-for="row in 8" :key="row">
                  <TableCell v-for="col in 7" :key="col" class="py-4">
                    <Skeleton class="h-4 w-full" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter
          class="flex items-center justify-between border-t px-6 py-4"
        >
          <Skeleton class="h-4 w-40" />
          <div class="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              <Skeleton class="h-4 w-10" />
            </Button>
            <Skeleton class="h-4 w-24" />
            <Button variant="outline" size="sm" disabled>
              <Skeleton class="h-4 w-12" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>

    <!-- Columna de filtros (sidebar) -->
    <!-- <div class="w-72 flex-shrink-0 hidden lg:block">
      <Card class="sticky top-6">
        <CardHeader>
          <Skeleton class="h-6 w-24" />
        </CardHeader>
        <CardContent class="flex flex-col gap-6">
          <div class="space-y-2">
            <Skeleton class="h-4 w-28" />
            <Skeleton class="h-10 w-full" />
          </div>
          <div class="space-y-2">
            <Skeleton class="h-4 w-28" />
            <Skeleton class="h-10 w-full" />
          </div>
          <div class="space-y-2">
            <Skeleton class="h-4 w-32" />
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton class="h-9 w-full" />
        </CardFooter>
      </Card>
    </div> -->
  </div>
</template>