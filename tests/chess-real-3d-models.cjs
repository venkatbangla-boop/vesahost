/**
 * Real Chess 3D solid mesh acceptance. Pure Node: no mock Blender image.
 * Every piece has genuine geometric depth on all three axes and triangles.
 */
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const G=require(path.join(__dirname,'../apps/chess-360/chess-real-3d-models.js'));
assert.deepEqual(G.TYPES,['P','R','N','B','Q','K']);
const all=G.builds(),fingerprints=new Set();
for(const [name,mesh] of Object.entries(all)){
  assert.ok(mesh.positions instanceof Float32Array,name+' must have triangle positions');
  assert.ok(mesh.normals instanceof Float32Array,name+' must have real surface normals');
  assert.equal(mesh.vertexCount,mesh.positions.length/3,name+' count');
  assert.equal(mesh.vertexCount%3,0,name+' triangles');
  assert.equal(mesh.normals.length,mesh.positions.length,name+' normals');
  assert.ok(mesh.vertexCount>=200,name+' is an actual detailed model');
  for(const [axis,size] of ['x','y','z'].map((n,i)=>[n,mesh.bounds.size[i]])){
    assert.ok(size>.22,name+' must have 3D depth on '+axis);
  }
  for(let i=0;i<mesh.positions.length;i++)assert.ok(Number.isFinite(mesh.positions[i]),name+' finite XYZ');
  for(let i=0;i<mesh.normals.length;i++)assert.ok(Number.isFinite(mesh.normals[i]),name+' finite normals');
  const signature=mesh.vertexCount+'-'+mesh.bounds.max.join('-');
  assert.ok(!fingerprints.has(signature),'different pieces must be geometrically distinct: '+name);
  fingerprints.add(signature);
  assert.ok(mesh.solid===true,'solid volume '+name);
}
const board=G.board();
assert.deepEqual(Object.keys(board),['frame','trim','light','dark']);
assert.equal(board.light.vertexCount,32*36,'32 raised, six-faced light squares');
assert.equal(board.dark.vertexCount,32*36,'32 raised, six-faced dark squares');
const models=Object.fromEntries(Object.entries(all).map(([t,m])=>[t,{
  vertices:m.vertexCount,
  size:m.bounds.size.map(n=>Number(n.toFixed(2)))
}]));
console.log('CHESS_REAL_3D_GEOMETRY_PASS '+JSON.stringify({
  pieces:12,instancesAtStart:32,solidMeshTypes:G.TYPES.length,boardTiles:64,models
}));
